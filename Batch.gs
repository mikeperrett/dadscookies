function testUpdateBatch() {
  var batch = updateBatch(Form.ClassicChocolateChip, 'Fresno');
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

function updateBatch(flavor, location) {
  const flavors = new CFlavors();
  var batch = {};
  flavors.list.forEach(f => {
    if (f.formName == flavor) {
      const batches = new CBatches();
      batches.list.forEach(b => {
        if (b.location == location && b.name == f.name) {
          b.completed++;
          batch = b;
          batches.update(b);
          batches.save();
        }
      })
    }
  });
  buildInstructionsDoc();
  return batch;
}