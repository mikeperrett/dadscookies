class StockItem {
  constructor(id, data) {
    this.id = Number(id).toFixed(0);
    this.name = data[0];
    this.amount = Number(data[1]);
    this.uom = data[2];
    this.location = data[3];
    this.minimum = Number(data[4] ?? 0);
    this.actual = Number(data[5] ?? 0);
  }
}

class CStock {
  constructor() {
    this.added = [];
    this.sheet = getSheet(Sheet.Stock);
    this.range = this.sheet.getDataRange();
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new StockItem(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id && data.id >= 0) {
        this.values[data.id] = [data.name, data.amount, data.uom, data.location, data.minimum, data.actual];
      }
    }
    this.add = function(data) {
      const id = Math.max(...this.list.map(x => x.id)) + 1;
      const item = new StockItem(id, data);
      this.list.push(item);
      this.added.push([item.name, item.amount, item.uom, item.location, item.minimum, item.actual]);
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}