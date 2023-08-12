class Flavor {
  constructor(id, data) {
    this.id = id;
    this.name = data[0];
    this.form = data[1];
    this.enabled = Boolean(data[2]);
    this.special = Boolean(data[3]);
    this.formName = data[4];
    this.yield = Number(data[5]);
  }
}

class CFlavors {
 constructor() {
    this.range = getRange(Sheet.Flavors);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][1]) {
        this.list.push(new Flavor(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.form, data.enabled, data.special, data.formName, data.yeild];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}
