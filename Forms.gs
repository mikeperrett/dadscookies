function updateShippingForm() {
  const form = FormApp.openById(getDrive(DriveName.ShipmentReceivedMobile));
  var data = new CStock().list;
  var ingredients = [];
  for (x in data) {
    if (data[x].location == 'Fresno') {
      ingredients.push(data[x].name)
    }
  }
  var formValues = form.getItems();
  var uoms = Object.values(UnitOfMeasure);
  setupShippingInputs(formValues, ingredients, uoms, '1st');
  setupShippingInputs(formValues, ingredients, uoms, '2nd');
  setupShippingInputs(formValues, ingredients, uoms, '3rd');
  setupShippingInputs(formValues, ingredients, uoms, '4th');
  setupShippingInputs(formValues, ingredients, uoms, '5th');
}

function updateManualInventoryForm() {
  const form = FormApp.openById(getDrive(DriveName.ManualInventoryForm));
  const inventoryInputSheet = SpreadsheetApp.openById(getDrive(DriveName.ShipmentRecievedDesktop));
  var data = inventoryInputSheet.getSheetByName('Shipment').getDataRange().getValues();
  var ingredients = [];
  for (x in data) {
    if (x > 1) {
      ingredients.push(data[x]);
    }
  }
  var formValues = form.getItems();
  form.setTitle('Manual Inventory Input')
    .setDescription('Enter all inventory items listed below in the Unit of Measure required')
    .setConfirmationMessage('Thanks for your help in keeping our inventory current!')
    .setAllowResponseEdits(false)
    .setAcceptingResponses(true);
  form.setShowLinkToRespondAgain(false);

  for(index = 0; index < ingredients.length; index++) {
    const i = ingredients[index];
    if (index + 2 < formValues.length) {
      updateFormField(formValues[index + 2].asTextItem(), i, false);
    } else {
      updateFormField(form.addTextItem(), i, false);
    }
  }
}

function updateFormField(item, ingredient, required) {
  item.setTitle(`${ingredient[0]} (${ingredient[2]})`);
  item.setRequired(required);
}

function setupShippingInputs(formValues, ingredients, uoms, ordinal) {
  var ingredient = formValues.findIndex(x => x.getTitle() == 'Select Ingredient (' + ordinal + ')');
  if (ingredient >= 0) {
    var question = formValues[ingredient].asListItem();
    var choices = [];
    for(y in ingredients) {
      choices.push(question.createChoice(ingredients[y]));
    }
    question.setChoices(choices);
  }
  var uom = formValues.findIndex(x => x.getTitle() == 'Select Unit of Measure (' + ordinal + ')');
  if (uom >= 0) {
    var question = formValues[uom].asListItem();
    var uomList = [];
    for(y in uoms) {
      uomList.push(question.createChoice(uoms[y]));
    }
    question.setChoices(uomList);
  }
}

function updateAllForms() {
  Logger.log('Updating all forms from data source');
  var users = (new CUsers(Sheet.Users).list).sort((x, y) => x - y );
  const locations = getLocations();
  updateLocationsAndEmployees(getDrive(DriveName.ClassicChocolateChip), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.CookiesNCream), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.CakeBatter), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.Snickerdoodle), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.PeanutButterChocolateChip), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.ChocolatePeanutButterChip), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.OatmealChocolateChip), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.OatmealRaisin), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.CookieCounter), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.SpecialCookieOne), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.SpecialCookieTwo), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.ShipmentReceivedMobile), users, locations);
  updateLocationsAndEmployees(getDrive(DriveName.ManualInventoryForm), users, locations);
  
  var recipes = new CBatchRecipes().list;
  var specials = getSpecials();
  updateCookieCounter(specials);
  updateShippingForm();
  updateManualInventoryForm();

  // Update the special cookies that are enabled
  buildSpecialsForms(specials, recipes);
}


function setQuestion(form, questions, title, steps) {
  var q = questions.findIndex(x => x.getTitle() == title);
  if (q < 0 && steps && steps.length > 0) { 
    var question = form.addCheckboxItem();
    setCheckboxItem(question, title, steps);
  } else {
    if (steps && steps.length) {
      var question = questions[q].asCheckboxItem();
      setCheckboxItem(question, title, steps);
    } else if (q >= 0) {
      questions[q].asCheckboxItem().setChoices([questions[q].asCheckboxItem().createChoice('None')]);
      questions[q].asCheckboxItem().setRequired(false);
      questions[q].asCheckboxItem().setValidation(null);
    }
  }
}

function setCheckboxItem(question, title, steps) {
  question.setTitle(title);
  question.setRequired(true);
  var choices = [];
  for (x in steps) {
    // step formValues are either quantities or instructions
    if (steps[x].amount > 0) {
      // If the number is an integer, then change the format string
      if (Number.isInteger(steps[x].amount)) {
        choices.push(question.createChoice(Utilities.formatString('%0d %s %s', steps[x].amount, steps[x].uom, steps[x].ingredient)));
      } else {
        choices.push(question.createChoice(Utilities.formatString('%01.3f %s %s', steps[x].amount, steps[x].uom, steps[x].ingredient)));
      }
    } else {
      choices.push(question.createChoice(steps[x].ingredient));
    }
  }
  question.setChoices(choices);
  var validation = FormApp.createCheckboxValidation()
    .setHelpText('You must complete all formValues in this step')
    .requireSelectExactly(steps.length)
    .build();
  question.setValidation(validation);
}

function testBuildSpecialsForms() {
  var recipes = new CBatchRecipes().list;
  var specials = getSpecials();
  buildSpecialsForms(specials, recipes)
}

function buildSpecialsForms(specials, recipes) {
  specials.forEach(s => {
    if (s.enabled) {
      var recipe = recipes.filter(r => r.name === s.name);
      if (recipe) {
        var data = { 
          'title': s.name
        };
        recipe.forEach(item => {
          if (item.step == 1) {
            if (!data.hasOwnProperty('step1')) {
              data.step1 = [];
            }
            data.step1.push(item);
          } else if (item.step == 2) {
            if (!data.hasOwnProperty('step2')) {
              data.step2 = [];
            }
            data.step2.push(item);
          } else if (item.step == 3) {
            if (!data.hasOwnProperty('step3')) {
              data.step3 = [];
            }
            data.step3.push(item);
          } else if (item.step == 4) {
            if (!data.hasOwnProperty('step4')) {
              data.step4 = [];
            }
            data.step4.push(item);
          } else if (item.step == 5) {
            if (!data.hasOwnProperty('step5')) {
              data.step5 = [];
            }
            data.step5.push(item);
          } else if (item.step == 6) {
            if (!data.hasOwnProperty('step6')) {
              data.step6 = [];
            }
            data.step6.push(item);
          }
        });
      }
      if (s.formName.indexOf(DriveName.SpecialCookieOne) === 0) {
        updateSpecialCookie(getDrive(DriveName.SpecialCookieOne), data);
      } else if (s.formName.indexOf(DriveName.SpecialCookieTwo) === 0) {
        updateSpecialCookie(getDrive(DriveName.SpecialCookieTwo), data);
      }
    }
  });
}

function updateSpecialCookie(formId, data) {
  var form = FormApp.openById(formId);
  form.setTitle(data.title)
    .setDescription('Enter the ingredients in the order that they appear below and check off the ingredients as you work.')
    .setConfirmationMessage('Thanks for your help in making a successful batch!')
    .setAllowResponseEdits(false)
    .setAcceptingResponses(true);
  form.setShowLinkToRespondAgain(false);
  var questions = form.getItems();
  setQuestion(form, questions, 'Step 1', data.step1);
  setQuestion(form, questions, 'Step 2', data.step2);
  setQuestion(form, questions, 'Step 3', data.step3);
  setQuestion(form, questions, 'Step 4', data.step4);
  setQuestion(form, questions, 'Step 5', data.step5);
  setQuestion(form, questions, 'Step 6', data.step6);
}

function testUpdateCookieCounter() {
  updateCookieCounter(getSpecials());
}

function updateCookieCounter(flavors) {
  var form = FormApp.openById(getDrive(DriveName.CookieCounter));
  var formValues = form.getItems();
  var special1 = formValues.find(x => x.getTitle() == 'Special Cookie One').asListItem();
  var special1Count = formValues.find(x => x.getTitle() == 'Special Cookie One Quantity').asTextItem();
  var special2 = formValues.find(x => x.getTitle() == 'Special Cookie Two').asListItem();
  var special2Count = formValues.find(x => x.getTitle() == 'Special Cookie Two Quantity').asTextItem();
  if (flavors.length) {
    var choices = [];
    for (x in flavors) {
      choices.push(special1.createChoice(flavors[x].name));
    } 
    special1.setRequired(true);
    special1Count.setRequired(true);
    special1.setChoices(choices);

    special2.setRequired(flavors.length > 1);
    special2Count.setRequired(flavors.length > 1);
    if (flavors.length > 1) {
      special2.setChoices(choices);
    } else {
      special2.setChoices([
        special2.createChoice('None')
      ]);
    }
  } else {
    special1.setRequired(false);
    special1Count.setRequired(false);
    special1.setChoices([
      special1.createChoice('None')
    ]);
    special2.setRequired(false);
    special2Count.setRequired(false);
    special2.setChoices([
      special2.createChoice('None')
    ]);
  }
}

// Update locations and employees list in all forms
function updateLocationsAndEmployees(formId, users, locations) {
  var form = FormApp.openById(formId);
  form.setShowLinkToRespondAgain(false);
  // Update some formValues from the ss
  var questions = form.getItems();

  // Iterate the questions
  for (var index in questions) {
    switch(index) {
      case '0': // Location
        var question = questions[index].asListItem();
        var options = [];
        locations.forEach(l => options.push(question.createChoice(l)));
        question.setTitle('Where are you working today?')
          .setChoices(options)
        break;
      case '1': // Employees  
        var question = questions[index].asListItem();
        var employees = [];
        for (var value in users) {
          if (users[value]) {
            employees.push(question.createChoice(users[value].name));
          }
        }
        question.setChoices(employees);
        break;
    }
  }
}

function formSubmitted(e) {
  var sheet = SpreadsheetApp.getActive().getName(); 
  var values = e.values;
  if (updateStock(sheet, values[1])) {
    var batch = updateBatch(sheet, e.values[1]);
    if (batch) {
      var subject = 'Batch Completed for (' + batch.name + ')';
      var emailBody = buildBatchCompletedEmail(e.values, batch);
      sendNotification(subject, emailBody, NotificationType.Batch);
      checkStockAlerts();
      buildInstructionsDoc();
    }
  }
}