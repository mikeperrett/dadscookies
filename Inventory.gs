
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
    body += Utilities.formatString('%d %s "%s"\n', received[item].amount, received[item].uom, received[item].ingredient);
  }
  sendNotification(subject, body, NotificationType.Inventory);
}

function updateInventoryFromShipment(location, received) {
  Logger.log('Updating inventory for ' + location);
  var stockRange = getRange(Sheet.Stock);
  var stockValues = stockRange.getValues();

  // Iterate over the stockRange formValues; updating from the batch we are processing
  for (var value in stockValues) {
    for (var item in received) {
      // If the batch recipe uses an ingredient
      if (received[item].ingredient === stockValues[value][0] && location === stockValues[value][3]) {
        // Increment the stock
        var remaining = Number(stockValues[value][1]) + convertUom(received[item].uom, stockValues[value][2], received[item].amount);
        stockValues[value][1] = remaining;        
      }
    }
  }
  stockRange.setValues(stockValues);
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
  var range = getRange(Sheet.Frozen);
  var rangeValues = range.getValues();
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
    for (var index in rangeValues) {
      if (index && (rangeValues[index][0].indexOf(flavor) == 0) && rangeValues[index][2] == location) {
        Logger.log('Product: ' + rangeValues[index][0] + ', Flavor: ' + flavor + ', Count: ' + count);
        rangeValues[index][1] = count;
      } else if (index && special1 && (rangeValues[index][0].indexOf(special1) == 0) && rangeValues[index][2] == location) {
        // Logger.log('Product: ' + values[index][0] + ', Flavor: ' + flavor + ', Count: ' + count);
        rangeValues[index][1] = specialCount1;
      } else if (index && special2 && (rangeValues[index][0].indexOf(special2) == 0) && rangeValues[index][2] == location) {
        // Logger.log('Product: ' + values[index][0] + ', Flavor: ' + flavor + ', Count: ' + count);
        rangeValues[index][1] = specialCount2;
      }
    }    
  }
  range.setValues(rangeValues);
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
  Logger.log('Updating stock for ' + formName);
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