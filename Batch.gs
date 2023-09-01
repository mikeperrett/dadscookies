function testUpdateBatch() {
  var batch = updateBatch('SpecialCookieTwoDev', 'Lemoore');
  Logger.log(batch);
}

function resetDailyBatchProgress() {
  var batches = new CBatches();
  batches.list.forEach(batch => {
    batch.completed = 0;
    batches.update(batch);
  });
  batches.save();
  buildInstructionsDoc();
}

function updateBatch(formName, location) {
  const flavors = new CFlavors();
  const batches = new CBatches();
  var batch = {};
  var flavor = flavors.list.find(x => x.formName == formName);
  if (flavor) {
    var batch = batches.list.find(b => b.name === flavor.name && b.location === location);
    if (batch) {
      batch.completed++;
      batches.update(batch);
      upsertBatchHistory(batch, flavor.yield, location);
    }
    batches.save();
    buildInstructionsDoc();
  }
  return batch;
}

function upsertBatchHistory(batch, yield, location) {
  const history = new CHistory();
  var date = new Date().toLocaleDateString('en-us');
  var row = history.list.find(x => x.date == date && x.flavor == batch.name && x.location == location);
  if (row) {
    row.completed = batch.completed;
    row.yield = yield;
    row.total = batch.completed * yield;
    history.update(row);
  } else {
    history.add([date, batch.name, location, batch.completed, yield, batch.completed * yield]);
  }
  history.save();
  history.added.forEach(a => history.sheet.appendRow(a));
}