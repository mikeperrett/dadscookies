class RecipeItem {
  constructor(id, data) {
    this.id = Number(id).toFixed(0);
    this.name = data[0];
    this.ingredient = data[1];
    this.amount = Number(data[2]);
    this.uom = data[3];
    this.step = Number(data[4]).toFixed(0);
    var order = Number(data[5]);
    this.order = Number(order == 0 ? 0 : order).toFixed(0);
  }
}

class CBatchRecipes {
  constructor() {
    this.range = getRange(Sheet.BatchRecipes);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new RecipeItem(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.ingredient, data.amount, data.uom, data.step, data.order];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
    this.recipeList = function(name) {
      var list = this.list.filter(x => x.name == name);
      if (list) {
        return list;
      }
      return [];
    }
  }
  
}