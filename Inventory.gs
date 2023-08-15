function updateInventoryFromShippingSpreadsheet(ss) {
  var sheet = ss.getSheetByName('Shipment');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var location = values[1][3];
  var employee = values[1][4];
  var confirm = Browser.msgBox(
    `Are you sure that you want to add these items to your inventory for the ${location} location?`, 
    Browser.Buttons.YES_NO);
  if (confirm != 'yes') {
    return false;
  }
  var shipment = [];
  for (index in values) {
    var item = values[index];
    if (index > 0 && item[1]) {
      shipment.push([item[0], item[1], item[2], location]);
      values[index][1] = null;
    }
  }
  if (shipment.length) {
    if (updateInventoryFromShipment(location, shipment)) {
      sendInventoryReceivedEmail(location, shipment, employee);
      range.setValues(values);
    }
  }
}

function onReceivedShipment(e) {
  var formValues = e.namedValues;
  var received = [];
  var location = formValues['Where are you working today?'][0];
  var employee = formValues['Who are you?'][0];
  processShippingInput(received, formValues, '1st');
  processShippingInput(received, formValues, '2nd');
  processShippingInput(received, formValues, '3rd');
  processShippingInput(received, formValues, '4th');
  processShippingInput(received, formValues, '5th');
  if (updateInventoryFromShipment(location, received)) {
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

function testUpdateInventoryFromShipment() {
  var shipment = [];
  shipment.push(['AP Flour', 100, 'lb', 'Lemoore']);
  shipment.push(['Baking Powder', 10, 'lb', 'Lemoore']);
  shipment.push(['Cake Flour', 200, 'lb', 'Lemoore']);
  updateInventoryFromShipment('Lemoore', shipment);
}

function updateInventoryFromShipment(location, received) {
  Logger.log('Updating inventory for ' + location);
  const stock = new CStock();
  received.forEach(r => {
    const item = stock.list.find(x => x.name == r[0] && x.location == location);
    if (item) {
      Logger.log(`Updating item: ${item.name}`);
      item.amount += convertUom(r[2], item.uom, r[1]);
      stock.update(item);
    // } else {
    //   // Add the item
    //   stock.add(r);
    }
  });
  stock.save();
  buildInstructionsDoc();
  return true;
}


function processShippingInput(received, formValues, ordinal) {
  var value = formValues['Enter Amount Received (' + ordinal + ')'][0];
  if (value > 0) {
    received.push({
      'ingredient': formValues['Select Ingredient (' + ordinal + ')'][0],
      'uom': formValues['Select Unit of Measure (' + ordinal + ')'][0],
      'amount': formValues['Enter Amount Received (' + ordinal +')'][0]
    });
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