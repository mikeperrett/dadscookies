function updateInventoryFromShippingSpreadsheet(ss) {
  var sheet = ss.getSheetByName('Shipment');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var location = values[1][5];
  var employee = values[1][6];
  const ui = SpreadsheetApp.getUi();
  // Add some validation for the form
  if (!location) {
    ui.alert('Shipment Recieved', 'You must select a Location to submit this shipment to inventory', Browser.Buttons.OK);
    return false;
  }
  if (!employee) {
    ui.alert('Shipment Recieved', 'You must select an Employee to submit this shipment to inventory', Browser.Buttons.OK);
    return false;
  }
  const amounts = values.filter(x => x[1] && x[1] != 'Amount').map(x => x[1]) ?? 0;
  if (amounts.length == 0) {
    ui.alert('Shipment Recieved', 'You must enter an amount to submit this shipment to inventory', Browser.Buttons.OK);
    return false;
  }
  var confirm = ui.alert('Shipment Recieved', 
    `Are you sure that you want to update inventory at ${location.toLocaleUpperCase()}`, 
    Browser.Buttons.YES_NO);
  if (confirm != ui.Button.YES) {
    return false;
  }
  var shipment = [];
  for (index in values) {
    var item = values[index];
    if (index > 1) {
      if (item[0] && item[1]) {
        if (!item[2]) {
          // Throw this back to the user
          var message = `Missing "Received UOM" for "${item[0]}"`;
          ui.alert('Invalid Request', message, Browser.Buttons.OK);
          return false;
        }
        if (!item[3]) {
          var message = `Missing "Location UOM" for "${item[0]}"`;
          ui.alert('Invalid Request', message, Browser.Buttons.OK);
          return false;
        }
        shipment.push([item[0], item[1], item[2], item[3], item[4], location]);
        values[index][1] = null;
      }
    }
  }
  if (shipment.length) {
    if (updateInventoryFromShipment(location, shipment, DriveType.Spreadsheet)) {
      sendInventoryReceivedEmail(location, shipment, employee);
      range.setValues(values);
    }
  }
}

function testUpdateInventoryFromShipment() {
  var shipment = [];
  shipment.push(['AP Flour', 100, 'lb', 'kg', 15, 'Lemoore']);
  shipment.push(['Baking Powder', 10, 'lb', 'kg', 0.3, 'Lemoore']);
  shipment.push(['Cake Flour', 200, 'lb', 'kg', 20, 'Lemoore']);
  shipment.push(['Eggs', 300, 'u', 'u', 128, 'Lemoore']);
  updateInventoryFromShipment('Lemoore', shipment, DriveType.Spreadsheet);
}

function updateInventoryFromShipment(location, received, driveType) {
  Logger.log('Updating inventory for ' + location);
  const stock = new CStock();
  received.forEach(r => {
    const item = stock.list.find(x => x.name == r[0] && x.location == location);
    if (item) {
      Logger.log(`Updating item: ${item.name}`);
      item.amount += convertUom(r[2], r[3], r[1]);
      stock.update(item);
    } else {
      // Add the item with the conversion
      const amount = convertUom(r[2], r[3], r[1]);
      stock.add([r[0], amount, r[3], location, r[4]]);
    }
  });
  stock.save();
  // We only add new inventory types from the spreadsheet
  if (driveType == DriveType.Spreadsheet && stock.added && stock.added.length > 0) {
    const ui = SpreadsheetApp.getUi();
    var confirm = ui.alert('New Inventory Type',
    `You have added ${stock.added.length} new ${stock.added.length > 1 ? 'items' : 'item'} to inventory for the ${location} location.\nClick "Yes" to add the new items`, 
    Browser.Buttons.YES_NO);
    if (confirm == ui.Button.YES) {
      stock.added.forEach(a => stock.sheet.appendRow(a));
    }
  }

  buildInstructionsDoc();
  return true;
}

function onReceivedShipment(e) {
  var formValues = e.namedValues;
  var received = [];
  var location = formValues['Where are you working today?'][0];
  var employee = formValues['Who are you?'][0];
  processShippingInput(received, formValues, '1st', location);
  processShippingInput(received, formValues, '2nd', location);
  processShippingInput(received, formValues, '3rd', location);
  processShippingInput(received, formValues, '4th', location);
  processShippingInput(received, formValues, '5th', location);
  if (updateInventoryFromShipment(location, received, DriveType.Form)) {
    sendInventoryReceivedEmail(location, received, employee);
  }
}

function sendInventoryReceivedEmail(location, received, employee) {
  var subject = 'Shipment Recieved at ' + location + '\n\n';
  var date = new Date();
  var body = 'Submitted: ' + date.toLocaleString() + '\n';
  body += 'Location: ' + location + '\n';
  body += 'Employee: ' + employee + '\n';
  body += 'Items Received: \n';
  for (item in received) {
    body += Utilities.formatString('%d %s "%s"\n', received[item][1], received[item][2], received[item][0]);
  }
  sendNotification(subject, body, NotificationType.Inventory);
}

function processShippingInput(received, formValues, ordinal, location) {
  var value = formValues['Enter Amount Received (' + ordinal + ')'][0];
  if (value > 0) {
    received.push(
      [
        formValues['Select Ingredient (' + ordinal + ')'][0],
        formValues['Enter Amount Received (' + ordinal + ')'][0],
        formValues['Select Unit of Measure (' + ordinal + ')'][0],
        location
      ]);
  }
}

function updateFrozenInventory(e) {
  var frozen = new CFrozen();
  var inventory = frozen.list;
  var formValues = e.namedValues;
  var count = 0;
  var flavor = '';
  var location = formValues['Where are you working today?'][0];
  var special1 = formValues['Special Cookie One'][0];
  var special2 = formValues['Special Cookie Two'][0];
  var specialCount1 = formValues['Special Cookie One Quantity'][0];
  var specialCount2 = formValues['Special Cookie Two Quantity'][0];
  Logger.log('Updating frozen inventory for ' + location);
  for(var key in formValues) {    
    flavor = key;
    count = formValues[key];
    inventory.forEach(item => {
      if (item.name.indexOf(flavor) == 0 && item.location == location) {
        // Logger.log('Item: ' + item.name + ', Flavor: ' + flavor + ', Count: ' + count + ', Location: ' + item.location);
        item.count = count;
        frozen.update(item);
      } else if (special1 && item.name.indexOf(special1) == 0 && item.location == location) {
        item.count = specialCount1;
        frozen.update(item);
      } else if (special2 && item.name.indexOf(special2) == 0 && item.location == location) {
        item.count = specialCount2;
        frozen.update(item);
      }
    });
  }
  frozen.save();
  buildInstructionsDoc();
}

function sendIngredientsInventory() {
  var stock = new CStock().list;
  var fresnoStock = '';
  var lemooreStock = '';
  for(s in stock) {
    var item = stock[s];
    var formatted = Utilities.formatString('%s: %01.3f %s\n', item.name, item.amount, item.uom);
    if (item.location === 'Fresno') {
      fresnoStock += formatted;
    } else if (item.location == 'Lemoore') {
      lemooreStock += formatted;
    }
  }
  if (fresnoStock) {
    sendNotification('Fresno Ingredients Inventory', fresnoStock, NotificationType.Inventory);
  }
  if (lemooreStock) {
    sendNotification('Lemoore Ingredients Inventory', lemooreStock, NotificationType.Inventory);
  }
}

function testUpdateStock() {
  updateStock('ChocolateChip', 'Fresno');
}

function updateStock(formName, location) {
  Logger.log(`Updating stock for ${formName} at ${location} location`);
  var stock = new CStock();
  var flavors = new CFlavors();
  var flavor = flavors.list.find(x => x.formName == formName);
  var recipe = new CBatchRecipes().list.filter(x => x.name == flavor.name);
  for (var value in stock.list) {
    for (var item in recipe) {
      // If the recipe uses an ingredient
      if (recipe[item].ingredient === stock.list[value].name && location === stock.list[value].location) {
        // Decrement the stock
        var remaining = stock.list[value].amount - recipe[item].amount;
        // Logger.log(stockValues[value] + ' remaining: ' + remaining);
        stock.list[value].amount = remaining;
        Logger.log(`Updating stock for ${stock.list[value].name}`);
        // stock.update(stock.list[value]);        
      }
    }
  }
  stock.save();
  checkStockAlerts(location, stock.list);
  return true;
}

function checkStockAlerts(location, stockValues) {
  var subject = 'Low Inventory Notification for ' + location;
  var message = '';
  for (var index in stockValues) {
    var stockItem = stockValues[index];
    if (stockItem.amount < stockItem.minimum && stockItem.location == location) {
      message += Utilities.formatString('"%s", at %01.3f %s, has fallen below %01.3f %s\n',
        stockItem.name, stockItem.amount, stockItem.uom, stockItem.minimum, stockItem.uom);
    }
  }
  if (message.length > 0) {
    var body = 'The following inventory has fallen below the desired levels:\n\n' + message;
    sendNotification(subject, body, NotificationType.Inventory);
  }
}