function onEditWorkbook(e) {
  const column = e.range.getColumn();
  const sheet = e.range.getSheet().getName();
  if (sheet === Sheet.Lists && column === 1) {
    editLocation(e);
  } else if (sheet === Sheet.Lists && column === 2) {
    editFlavor(e);
  } else if (sheet === Sheet.Lists && column === 3) {
    editIngredient(e);
  }
}

function editUser(e) {

}

function editIngredient(e) {
 if (e.oldValue === undefined) {
      Logger.log('New Ingredient was created: ' + e.value);
    } else if (e.value === undefined) {
      Logger.log('Ingredient was deleted: ' + e.oldValue);
    } else {
      Logger.log(`Update old Ingredient from "${e.oldValue}" to "${e.value}"`);
      var stock = new CStock();
      stock.list.forEach(x => {
        if (x.name === e.oldValue) {
          x.name = e.value;
          Logger.log(`CStock.Updated ${x.name}`);
          stock.update(x);
        }
      });
      stock.save();
      var recipes = new CBatchRecipes();
      recipes.list.forEach(x => {
        if (x.ingredient === e.oldValue) {
          x.ingredient = e.value;
          Logger.log(`CBatchRecipes.Updated ${x.ingredient}`);
          recipes.update(x);
        }
      });
      recipes.save();
    }
}

function editLocation(e) {
  if (e.oldValue === undefined) {
      Logger.log('New Location was created: ' + e.value);
    } else if (e.value === undefined) {
      Logger.log('Location was deleted: ' + e.oldValue);
    } else {
      Logger.log(`Update old location from "${e.oldValue}" to "${e.value}"`);
      var stock = new CStock();
      stock.list.forEach(x => {
        if (x.location === e.oldValue) {
          x.location = e.value;
          Logger.log(`CStock.Updated ${x.location}`);
          stock.update(x);
        }
      });
      stock.save();
      var frozen = new CFrozen();
      frozen.list.forEach(x => {
        if (x.location === e.oldValue) {
          x.location = e.value;
          Logger.log(`CFrozen.Updated ${x.location}`);
          frozen.update(x);
        }
      });
      frozen.save();
      var batches = new CBatches();
      batches.list.forEach(x => {
        if (x.location === e.oldValue) {
          x.location = e.value;
          Logger.log(`CBatches.Updated ${x.location}`);
          batches.update(x);
        }
      });
      batches.save();
      var users = new CUsers();
      users.list.forEach(x => {
        if (x.currentLocation === e.oldValue) {
          x.currentLocation = e.value;
          Logger.log(`CUsers.Updated ${x.currentLocation}`);
          users.update(x);
        }
      });
      users.save();
    }
}

function editFlavor(e) {
  if (e.oldValue === undefined) {
      Logger.log('New Flavor was created: ' + e.value);
    } else if (e.value === undefined) {
      Logger.log('Flavor was deleted: ' + e.oldValue);
    } else {
      Logger.log(`Update old flavor from "${e.oldValue}" to "${e.value}"`);
      var flavors = new CFlavors();
      flavors.list.forEach(x => {
        if (x.name === e.oldValue) {
          x.name = e.value;
          Logger.log(`CFlavors.Updated ${x.name}`);
          flavors.update(x);
        }
      });
      flavors.save();
      var recipes = new CBatchRecipes();
      recipes.list.forEach(x => {
        if (x.name === e.oldValue) {
          x.name = e.value;
          Logger.log(`CBatchRecipes.Updated ${x.name}`);
          recipes.update(x);
        }
      });
      recipes.save();
      var batches = new CBatches();
      batches.list.forEach(x => {
        if (x.name === e.oldValue) {
          x.name = e.value;
          Logger.log(`CBatches.Updated ${x.name}`);
          batches.update(x);
        }
      });
      batches.save();
    }
}