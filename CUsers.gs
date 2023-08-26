class User {
  constructor(id, data) {
    this.id = Number(id).toFixed(0);
    this.name = data[0];
    this.email = data[1];
    this.currentLocation = data[2];
    this.batchNotifications = Boolean(data[3]);
    this.inventoryNotifications = Boolean(data[4]);
  }
}

class CUsers {
  constructor() {
    this.range = getRange(Sheet.Users);
    this.values = this.range.getValues();
    this.list = [];
    for (var x in this.values) {
      if (this.values[x][0]) {
        this.list.push(new User(x, this.values[x]));
      }
    }
    this.update = function(data) {
      if (data.id >= 0) {
        this.values[data.id] = [data.name, data.email, data.currentLocation, data.batchNotifications, data.inventoryNotifications];
      }
    }
    this.save = function() {
      this.range.setValues(this.values);
    }
  }
}