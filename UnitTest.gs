function testStockUpdates() {
  testStockUpdate('Fresno', Form.ClassicChocolateChip);
  testStockUpdate('Fresno', Form.CookiesNCream);
  testStockUpdate('Fresno', Form.CakeBatter);
  testStockUpdate('Fresno', Form.Snickerdoodle);
  testStockUpdate('Fresno', Form.PeanutButterChocolateChip);
  testStockUpdate('Fresno', Form.ChocolatePeanutButterChip);
  testStockUpdate('Fresno', Form.OatmealChocolateChip);
  testStockUpdate('Fresno', Form.OatmealRaisin);
}

function testStockUpdate(location, form) {
  var range = getRange(Sheet.Stock);
  var before = range.getValues();
  var recipe = getBatchRecipe(form);
  updateStock(form, location);
  var after = getRange(Sheet.Stock).getValues();
  // Compare the values for chocolate chip
  for (var r in recipe) {
    var ingredient = recipe[r][1];
    var value = recipe[r][2];
    // Logger.log(Utilities.formatString('Checking ingredient %s with value of %01.3f', ingredient, value))
    for (var b in before) {
      if (before[b][3] == location && before[b][0] == ingredient) {
        for (var a in after) {
          if (after[a][3] == location && after[a][0] == before[b][0]) {
            if (before[b][1] - value != after[a][1]) {
              Logger.log(Utilities.formatString('FAIL! Ingredient(%s), Value(%01.3f), Before(%01.3f), After(%01.3f)',
                ingredient, value, before[b][1], after[a][1]));
            }
            break;
          }
        }
        break;
      }
    }
  }
  // Restore the range to before our update
  range.setValues(before);
}
