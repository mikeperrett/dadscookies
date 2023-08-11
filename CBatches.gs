class Batch {
  constructor(id, data) {
    this.id = Number(id).toFixed(0);
    this.name = data[0];
    this.location = data[1];
    this.goal = Number(data[2]).toFixed(0);
    this.completed = Number(data[3]).toFixed(0);
  }
}

class CBatches {
  constructor() {
    this.range = getRange(Sheet.Batches);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (x > 0 && this.values[x][0]) {
        this.list.push(new Batch(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.location, data.goal, data.completed];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}