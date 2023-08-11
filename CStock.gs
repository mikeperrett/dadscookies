class StockItem {
  constructor(id, data) {
    this.id = Number(id).toFixed(0);
    this.name = data[0];
    this.amount = Number(data[1]);
    this.uom = data[2];
    this.location = data[3];
    this.minimum = Number(data[4]);
    this.actual = Number(data[5]);
  }
}

class CStock {
  constructor() {
    this.range = getRange(Sheet.Stock);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new StockItem(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.amount, data.uom, data.location, data.minimum, data.actual];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}