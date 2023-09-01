class HistoryItem {
  constructor(id, data) {
    this.id = id;
    this.date = new Date(data[0]).toLocaleDateString('en-us');
    this.flavor = data[1];
    this.location = data[2];
    this.completed = Number(data[3] ?? 0).toFixed(0);
    this.yield = Number(data[4] ?? 0).toFixed(0);
    this.total = Number(data[5] ?? 0).toFixed(0);
  }
}

class CHistory {
 constructor() {
    this.added = [];
    this.sheet = getSheet(Sheet.History);
    this.range = this.sheet.getDataRange();
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new HistoryItem(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.date, data.flavor, data.location, data.completed, data.yield, data.total];
      }
    }
    this.add = function(data) {
      const id = (this.list.length == 0) ? 1 : Math.max(...this.list.map(x => x.id)) + 1;
      const item = new HistoryItem(id, data);
      if (item) {
        this.list.push(item);
        this.added.push([item.date, item.flavor, item.location, item.completed, item.yield, item.total]);
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}
