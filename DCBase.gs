const UnitOfMeasure = {
  Kilogram: 'kg',
  Pound: 'lb',
  Unit: 'u',
  Ounce: 'oz',
  Gallon: 'gal',
  Cup: 'cup',
  NA: 'n/a',
}

function doGet() {
  var content = 'We currently support the following Units of Measure\n';
  getUoms().forEach(x => { 
    content += x + '\n'; 
    Logger.log(x);
  })
  return ContentService.createTextOutput(content);
}

function getUoms() {
  return Object.values(UnitOfMeasure);
}