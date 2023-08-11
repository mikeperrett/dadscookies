function convertUom(from, to, value) {
  if (from == UnitOfMeasure.Pound && to ==  UnitOfMeasure.Kilogram) {
    return Number(value) / 2.2046;
  }
  if (from == UnitOfMeasure.Gallon && to == UnitOfMeasure.Cup) {
    return Number(value) * 16.0;
  }
  if (from == UnitOfMeasure.Gallon && to == UnitOfMeasure.Ounce) {
    return Number(value) * 128.0;
  }
  if (from == UnitOfMeasure.Ounce && to == UnitOfMeasure.Cup) {
    return Number(value) / 8.0; 
  }
  return Number(value);
}
