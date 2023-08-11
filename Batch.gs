function testUpdateBatch() {
  var batch = updateBatch(Form.ClassicChocolateChip, 'Fresno');
  Logger.log(batch);
}

function resetDailyBatchProgress() {
  var range = getRange(Sheet.Batches);
  var batches = range.getValues();
  for (b in batches) {
    if (b > 0) {
      batches[b][3] = 0;
    }
  }
  range.setValues(batches);
  Instructions.buildDocument();
}

function updateBatch(flavor, location) {
  var batch = {};
  var flavors = getRange(Sheet.Flavors).getValues();
  for (f in flavors) {
    if (f > 0 && flavors[f][4] == flavor) {
      var batchesRange = getRange(Sheet.Batches);
      var batches = batchesRange.getValues();
      for (b in batches) {
        if (b > 0 && batches[b][0] == flavors[f][0] && location == batches[b][1]) {
          batches[b][3]++;
          batch = batches[b];
          batchesRange.setValues(batches);
          break;
        }
      }
      break;
    }
  }
  return batch;
}