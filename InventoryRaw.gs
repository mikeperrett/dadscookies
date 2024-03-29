
function updateInventoryFromManualForm(e) {
  Logger.log('Update inventory from Manual Inventory Form');
  const stock = new CStock();
  var location = e.namedValues['Where are you working today?'][0];
  // Get the uom's; received and stored from the 'ShipmentManagerInput' spreadsheet from which the input form was built
  const ss = SpreadsheetApp.openById(getDrive(DriveName.ShipmentRecievedDesktop))
  const stockWithUoms = ss.getSheetByName('Shipment').getDataRange().getValues();
  for(var key in e.namedValues) {    
    const amount = e.namedValues[key];
    if (amount > 0) {
      Logger.log(`${key}: ${amount}`)
      const stockItem = stock.list.find(x => key.indexOf(x.name) == 0 && x.location == location);
      if (stockItem) {
        stockWithUoms.forEach(row => {
          if (stockItem.name == row[0]) {
            stockItem.amount = convertUom(row[2], row[3], amount);
            // Logger.log(`Ingredient: ${key}, Amount: ${amount}, Item: ${stockItem.name}, FormUom: ${row[2]}, StoreUom: ${row[3]}, Converted: ${stockItem.amount}`);
            stock.update(stockItem);
          }
        });
      }
    }
  }
  stock.save();
  buildInstructionsDoc();
}

function getCurrentInventory(ss) {
  var sheet = ss.getSheetByName('Inventory');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var location = values[1][4];
  var employee = values[1][5];
  const ui = SpreadsheetApp.getUi();
  // Add some validation for the form
  if (!location) {
    ui.alert('Manual Inventory', 'You must select a Location to get the current inventory', Browser.Buttons.OK);
    return false;
  }
  if (!employee) {
    ui.alert('Manual Inventory', 'You must select an Employee to get the current inventory', Browser.Buttons.OK);
    return false;
  }
  // Get the stock 
  const stock = new CStock().list;
  for(index in values) {
    if (index > 1) {
      const item = stock.find(x => x.name === values[index][0] && x.location == location);
      if (item) {
        values[index][1] = convertUom(values[index][3], values[index][2], item.amount);
        values[index][3] = item.uom;
      } else {
        values[index][1] = null;
      }
    }
  }
  range.setValues(values);
}

function setCurrentInventory(ss) {
  var sheet = ss.getSheetByName('Inventory');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var location = values[1][4];
  var employee = values[1][5];
  const ui = SpreadsheetApp.getUi();
  // Add some validation for the form
  if (!location) {
    ui.alert('Manual Inventory', 'You must select a Location to get the current inventory', Browser.Buttons.OK);
    return false;
  }
  if (!employee) {
    ui.alert('Manual Inventory', 'You must select an Employee to get the current inventory', Browser.Buttons.OK);
    return false;
  }
    var confirm = ui.alert('Manual Inventory', 
    `Are you sure that you want to manually set inventory at ${location.toLocaleUpperCase()}`, 
    Browser.Buttons.YES_NO);
  if (confirm != ui.Button.YES) {
    return false;
  }
  const stock = new CStock();
  for(x in values) {
    if (x > 1) {
      const item = values[x]
      const inv = stock.list.find(x => x.name === item[0] && x.location === location);
      if ((inv && item[1]) || item[1] === 0) {
        Logger.log(`${item[0]} = [${item[1]}]`);
        inv.amount = convertUom(item[2], item[3], item[1]);
        inv.uom = item[3];
        stock.update(inv);
      } else if (item[0] && item[1] > 0) {
        // Add the item with the conversion
        const amount = convertUom(values[x][2], values[x][3], values[x][1]);
        stock.add([values[x][0], amount, values[x][3], location, values[x][4]]);
      }
    }
  }
  stock.save();
  // We only add new inventory types from the spreadsheet
  createStockItems(DriveType.Spreadsheet, stock, location);
  buildInstructionsDoc();
}

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
    if ((item && r[1]) || r[1] === 0) {
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
  createStockItems(driveType, stock, location);
  buildInstructionsDoc();
  return true;
}

function createStockItems(driveType, stock, location) {
   if (driveType == DriveType.Spreadsheet && stock.added && stock.added.length > 0) {
    const ui = SpreadsheetApp.getUi();
    var confirm = ui.alert('New Inventory Type',
    `You have added ${stock.added.length} new ${stock.added.length > 1 ? 'items' : 'item'} to inventory for the ${location} location.\nClick "Yes" to add the new items`, 
    Browser.Buttons.YES_NO);
    if (confirm == ui.Button.YES) {
      stock.added.forEach(a => stock.sheet.appendRow(a));
    }
  }
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
        stock.update(stock.list[value]);        
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