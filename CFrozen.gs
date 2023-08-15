class FrozenItem {
  constructor(id, data) {
    this.id = id;
    this.name = data[0];
    this.count = Number(data[1] ?? 0).toFixed(0);
    this.location = data[2];
    this.actual = Number(data[3] ?? 0).toFixed(0);
  }
}

class CFrozen {
 constructor() {
    this.range = getRange(Sheet.Frozen);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new FrozenItem(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.count, data.location, data.actual];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}
