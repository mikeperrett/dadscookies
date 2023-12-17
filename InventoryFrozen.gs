function testUpdateFrozenInventory() {
  updateFrozenInventory({
    'namedValues': {
      'Where are you working today?': ['Madera'],
      'Special Cookie One': ['Brookie'],
      'Special Cookie One Quantity': '11',
      'Special Cookie Two': [],
      'Special Cookie Two Quantity': '',
      'Classic Chocolate Chip': '21' 
    }
  });
}

// Insert or update inventory of frozen stock
function upsertFrozen(frozen, inventory, flavor, location, count) {
  var item = inventory.find(x => x.name.indexOf(flavor) == 0 && x.location == location);
  if (item) {
    item.count = count;
    frozen.update(item);
  } else {
    item = inventory.find(x => x.name.indexOf(flavor) == 0);
    if (item) {
      frozen.add([item.name, count, location]);
    }
  }
}

function updateFrozenInventory(e) {
  var frozen = new CFrozen();
  var inventory = frozen.list;
  var formValues = e.namedValues;
  var location = formValues['Where are you working today?'][0];
  var special1 = formValues['Special Cookie One'][0];
  var special2 = formValues['Special Cookie Two'][0];
  var specialCount1 = formValues['Special Cookie One Quantity'];
  var specialCount2 = formValues['Special Cookie Two Quantity'];
  var exclusions = [
    'Where are you working today?',
    'Who are you?',
    'Special Cookie One Quantity',
    'Special Cookie Two Quantity'
  ];
  Logger.log('Updating frozen inventory for ' + location);
  for(var key in formValues) {   
    if (key == 'Special Cookie One') {
      if (special1 && !isNaN(specialCount1)) {
        upsertFrozen(frozen, inventory, special1, location, specialCount1);
      }
    } else if (key == 'Special Cookie Two') {
      if (special2 && !isNaN(specialCount2)) {
        upsertFrozen(frozen, inventory, special2, location, specialCount2);
      }
    } else if (exclusions.indexOf(key) == -1) {
      const count = formValues[key];
      if (!isNaN(count)) {
        upsertFrozen(frozen, inventory, key, location, count);
      }
    }
  }
  frozen.save();
  frozen.added.forEach(a => frozen.sheet.appendRow(a));
  buildInstructionsDoc();
}

function frozenShipmentReceived(e) {
  var responses = e.response.getItemResponses();
  var location = responses[0].getResponse();
  var employee = responses[1].getResponse();
  var data = {
    'Location': location,
    'Employee': employee,
    'Responses': []
  };
  for(var key in responses) { 
    // Skip the name and location
    if (key > 1) {
      var count = responses[key].getResponse();
      if (count) {
        var flavor = responses[key].getItem().getTitle();
        data.Responses.push({'Flavor': flavor, 'Count': count});
      }
    }
  }
  if (data.Responses.length) {
    updateFrozenInventoryFromShipmentReceived(data);
  }
}

function testUpdateInventoryFromShipmentReceived() {
  var data = {
    'Employee': 'Mike P',
    'Location': 'Fresno', 
    'Responses': [ 
      { 'Flavor': 'Classic Chocolate Chip (170)', 'Count': 100 },
      { 'Flavor': 'Cookies n Cream (140)', 'Count': 100 },
      { 'Flavor': 'Snickerdoodle (190)', 'Count': 100 }
    ]
  }
  updateFrozenInventoryFromShipmentReceived(data);
  data.Location = 'Warehouse';
  updateFrozenInventoryFromShipmentReceived(data);
}

function updateFrozenInventoryFromShipmentReceived(data) {
  Logger.log(`Received frozen shipment at ${data.Location} from ${data.Employee}`);
  data.Responses.forEach(s => {
    Logger.log(`${s.Flavor}: ${s.Count}`);
  })

  var frozen = new CFrozen();
  var inventory = frozen.list;
  var warehouse = getLocations().find(l => l === 'Warehouse');
  data.Responses.forEach(flavor => {   
    appendAdjustFrozen(frozen, inventory, flavor, data.Location, warehouse);
  });
  frozen.save();
  frozen.added.forEach(a => frozen.sheet.appendRow(a));
  buildInstructionsDoc();
}

// Insert or update inventory of frozen stock
function appendAdjustFrozen(frozen, inventory, flavor, location, warehouse) {
  var count = Number(flavor.Count);
  var item = inventory.find(x => x.name.indexOf(flavor.Flavor) === 0 && x.location === location);
  var warehouseItem = inventory.find(x => x.name.indexOf(flavor.Flavor) === 0 && x.location === warehouse);
  if (warehouse != location) {
    if (item) {
      item.count = Number(item.count) + count;
      frozen.update(item);
    } else {
      item = inventory.find(x => x.name.indexOf(flavor.Flavor) === 0);
      if (item) {
        frozen.add([item.name, count, location]);
      }
    }
    if (warehouseItem) {
      warehouseItem.count = Number(warehouseItem.count) - count;
      frozen.update(warehouseItem);
    } else {
      warehouseItem = inventory.find(x => x.name.indexOf(flavor.Flavor) === 0);
      if (warehouseItem) {
        frozen.add([warehouseItem.name, count, warehouse]);
      }
    }
  } else if (warehouseItem) {
    warehouseItem.count = Number(warehouseItem.count) + count;
    frozen.update(warehouseItem);
  } else {
    warehouseItem = inventory.find(x => x.name.indexOf(flavor.Flavor) === 0);
    if (warehouseItem) {
      frozen.add([warehouseItem.name, count, warehouse]);
    }
  }
}