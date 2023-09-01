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