function testStockUpdates() {
  testStockUpdate('Fresno', DriveName.ClassicChocolateChip);
  testStockUpdate('Fresno', DriveName.CookiesNCream);
  testStockUpdate('Fresno', DriveName.CakeBatter);
  testStockUpdate('Fresno', DriveName.Snickerdoodle);
  testStockUpdate('Fresno', DriveName.PeanutButterChocolateChip);
  testStockUpdate('Fresno', DriveName.ChocolatePeanutButterChip);
  testStockUpdate('Fresno', DriveName.OatmealChocolateChip);
  testStockUpdate('Fresno', DriveName.OatmealRaisin);
}

function testStockUpdate(location, form) {
  var before = new CStock();
  var flavor = new CFlavors().list.find(x => x.formName == form);
  const recipe = new CBatchRecipes().list.filter(x => x.name == flavor.name);
  updateStock(form, location);
  var after = new CStock().list;
  recipe.forEach(r => {
    const ingredient = r.ingredient;
    const value = r.amount;
    before.list.forEach(b => {
      if (b.location == location && b.name == ingredient) {
        after.forEach(a => {
          if (a.location == location && a.name == b.name) {
            if (b.amount - value != a.amount) {
               Logger.log(Utilities.formatString('FAIL! Ingredient(%s), Value(%01.3f), Before(%01.3f), After(%01.3f)',
                ingredient, value, b.amount, a.amount));
            }
          }
        })
      }
    })
  });
  before.save();
}
