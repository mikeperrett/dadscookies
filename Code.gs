const STOCK_WB = 'https://docs.google.com/spreadsheets/d/1-_Qob4UiwEByJKeyodi6zDfrJnojNUUYB9NPK-cNZqU/edit';

const UnitOfMeasure = {
  Kilogram: 'kg',
  Pound: 'lb',
  Unit: 'u',
  Ounce: 'oz',
  Gallon: 'gal',
  Cup: 'cup',
  NA: 'n/a',
}

const NotificationType = {
  Batch: 0,
  Inventory: 1
}

const Sheet = {
  Stock: 'Stock',
  BatchRecipes: 'BatchRecipes',
  Batches: 'Batches',
  Frozen: 'FrozenInventory',
  Lists: 'Lists',
  Flavors: 'Flavors',
  Users: 'Users'
}

const Form = {
  ClassicChocolateChip: 'ChocolateChip',
  CookiesNCream: 'CookiesNCream',
  CakeBatter: 'BirthdayCakeBatter',
  Snickerdoodle: 'Snickerdoodle',
  PeanutButterChocolateChip: 'PeanutButterChocolateChip',
  ChocolatePeanutButterChip: 'ChocolatePeanutButterChip',
  OatmealChocolateChip: 'OatmealChocolateChip',
  OatmealRaisin: 'OatmealRaisin',
  SpecialCookieOne: 'SpecialCookieOne',
  SpecialCookieTwo: 'SpecialCookieTwo'
}

const FormId = {
  ClassicChocolateChip: '1L8OT7CsMQNwNc-8ZU2VohK0P7o02xleb7sfJ70qRfv8',
  CookiesNCream: '1y1joj74-G4VN5b24yIONNi_U2Bt2g1RKT5vWx_aDcgI',
  CakeBatter: '1dZt56rIYQi1JsYpeKq7mKMJ0N871-DRBcSSI2HNnaGo',
  Snickerdoodle: '1HIObZDu84OzgZikAUnjygnuuPBL-3xrzlgBGoVlMi_c',
  PeanutButterChocolateChip: '1IAqe6nn3Fzpz5L6P6BJ7naK6MxQ4g9FBlsqM3TEJNWg',
  ChocolatePeanutButterChip: '1ptuRAXSorQMdL_AX9QTyd14fc7gQ_8XcwsQK3di_yNc',
  OatmealChocolateChip: '1UxWoHprHywy9kg1t7_rbk_K23Ge2K8ZDQ3tvvYhvONU',
  OatmealRaisin: '1qiss8IZCtYBA-FWUcYFYgYgUK3c-pfsdt81QLUsjg2U',
  SpecialCookieOne: '1iUJezM6gziCGkDSzcO4HPsWvMVbcyy9nQBH7TFcM2IA',
  SpecialCookieTwo: '1WK8NEaiLbEOTDDUwPWKrjxhIY6ocUjKXSuqgjqAl38A',
  CookieCounter: '1ImDLQuuR5BdacaLSedMpF4uLvrOMwpq7he1mXVnb7c8',
  ShipmentRecievedDesktop: '1-x1QNOMd9YnawMjbUbT7sAsTCyV0DQ0rkDhu5J19rAY',
  ShipmentReceivedMobile: '1yVJStpXYfMnCk4xpYNZczBk66hrUiD-wPF8GQAa5wKc'
}

function doGet() {
  // var batches = getBatches();
  // var content = ''
  // batches.list.forEach(x => {
  //   content += Utilities.formatString('Batch: %s, Location: %s, Daily Batch Goal: %d\n', 
  //     x.name, x.location, x.goal);
  // });
  // return ContentService.createTextOutput(content);
  // return HtmlService.createHtmlOutput('<h1>Hello There</h1');
  return ContentService.createTextOutput('Version v5');
//   return HtmlService.createHtmlOutputFromFile('index');
}

function getAuthorization() {
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  Logger.log(authInfo.getAuthorizationStatus());
  return authInfo;
}

function getBatches() {
  return new CBatches();
}

function getStock() {
  return new CStock();
}

function getUoms() {
  return Object.values(UnitOfMeasure);
}

function getData() {
  var x = new CBatchRecipes();
  // for(index in x.list) {
  //   var u = x.list[index];
  //   Logger.log(u.id + ', ' + u.name + ', ' + u.email + ', ' + u.batchNotifications + ', ' + u.inventoryNotifications);
  // }

  var obj = x.recipeList('Smores (170)').sort((x, y) => x.order > y.order );
  if (obj) {
    for (o in obj) {
      if (obj[o].amount > 0) {
        Logger.log(Utilities.formatString('%d (step%d): %01.3f %s %s',
          obj[o].order, obj[o].step, obj[o].amount, obj[o].uom, obj[o].ingredient));
      } else {
        Logger.log(Utilities.formatString('%d (step%d): %s',
          obj[o].order, obj[o].step, obj[o].ingredient));
      }
      if (Number(obj[o].id) == 113) {
        obj[o].amount = 0;
        x.update(obj[o]);
      }
    }
  }
  x.save();
}

function updateShippingForm() {
  const form = FormApp.openById(FormId.ShipmentReceivedMobile);
  var data = new CStock().list;
  var ingredients = [];
  for (x in data) {
    if (data[x].location == 'Fresno') {
      ingredients.push(data[x].name)
    }
  }
  values = getRange(Sheet.Lists).getValues();
  var formValues = form.getItems();
  var uoms = getUoms();
  setupShippingInputs(formValues, ingredients, uoms, '1st');
  setupShippingInputs(formValues, ingredients, uoms, '2nd');
  setupShippingInputs(formValues, ingredients, uoms, '3rd');
  setupShippingInputs(formValues, ingredients, uoms, '4th');
  setupShippingInputs(formValues, ingredients, uoms, '5th');
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
  var users = new CUsers(Sheet.Users);
  updateLocationsAndEmployees(FormId.ClassicChocolateChip, users.list);
  updateLocationsAndEmployees(FormId.CookiesNCream, users.list);
  updateLocationsAndEmployees(FormId.CakeBatter, users.list);
  updateLocationsAndEmployees(FormId.Snickerdoodle, users.list);
  updateLocationsAndEmployees(FormId.PeanutButterChocolateChip, users.list);
  updateLocationsAndEmployees(FormId.ChocolatePeanutButterChip, users.list);
  updateLocationsAndEmployees(FormId.OatmealChocolateChip, users.list);
  updateLocationsAndEmployees(FormId.OatmealRaisin, users.list);
  updateLocationsAndEmployees(FormId.CookieCounter, users.list);
  updateLocationsAndEmployees(FormId.SpecialCookieOne, users.list);
  updateLocationsAndEmployees(FormId.SpecialCookieTwo, users.list);
  updateLocationsAndEmployees(FormId.ShipmentReceivedMobile, users.list);
  
  var recipes = new CBatchRecipes().list;
  var specialFlavors = getSpecials();
  updateCookieCounter(specialFlavors);
  updateShippingForm();

  // Update the special cookies that are enabled
  for (s in specialFlavors) {
    // Colum two is where it's enabled
    if (specialFlavors[s].enabled) {
      var flavor = specialFlavors[s];
      var step1 = [];
      var step2 = [];
      var step3 = [];
      var step4 = [];
      for (index in recipes) {
        var item = recipes[index];
        if (index > 0 && item.name == flavor.name) {
          if (item.step == 1) {
            step1.push(item);
          } else if (item.step == 2) {
            step2.push(item);
          } else if (item.step == 3) {
            step3.push(item);
          } else {
            step4.push(item);
          }
        }      
      }
      var data = { 'title': flavor.name, 'step1': step1, 'step2': step2, 'step3': step3, 'step4': step4 };
      if (flavor.formName == Form.SpecialCookieOne) {
        updateSpecialCookie(FormId.SpecialCookieOne, data);
      } else if (flavor.formName == Form.SpecialCookieTwo) {
        updateSpecialCookie(FormId.SpecialCookieTwo, data);
      }
    }
  }
}

function getSpecials() {
  var flavors = [];
  var data = new CFlavors().list;
  for (d in data) {
    if (data[d].enabled && data[d].special) {
      flavors.push(data[d]);
    }
  }
  return flavors;
}

function setQuestion(form, questions, title, steps) {
  var q = questions.findIndex(x => x.getTitle() == title);
  if (q < 0 && steps.length > 0) { 
    var question = form.addCheckboxItem();
    setCheckboxItem(question, title, steps);
  } else {
    if (steps.length) {
      var question = questions[q].asCheckboxItem();
      setCheckboxItem(question, title, steps);
    } else if (q >= 0) {
      questions[q].asCheckboxItem().setChoices([questions[q].asCheckboxItem().createChoice('None')]);
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
      choices.push(question.createChoice(Utilities.formatString('%01.3f %s %s', steps[x].amount, steps[x].uom, steps[x].ingredient)));
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

function updateSpecialCookie(formId, data) {
  var form = FormApp.openById(formId);
  form.setTitle(data.title)
    .setDescription('Enter the ingredients in the order that they appear below and check off the ingredients as you work.')
    .setConfirmationMessage('Thanks for your help in making a successful batch!')
    .setAllowResponseEdits(false)
    .setAcceptingResponses(true);
  form.setShowLinkToRespondAgain(true);
  var questions = form.getItems();
  setQuestion(form, questions, 'Step 1', data.step1);
  setQuestion(form, questions, 'Step 2', data.step2);
  setQuestion(form, questions, 'Step 3', data.step3);
  setQuestion(form, questions, 'Step 4', data.step4);
}

function updateCookieCounter(flavors) {
  var form = FormApp.openById(FormId.CookieCounter);
  var formValues = form.getItems();
  var special1 = formValues.findIndex(x => x.getTitle() == 'Special Cookie One');
  var special1Count = formValues.findIndex(x => x.getTitle() == 'Special Cookie One Quantity');
  var special2 = formValues.findIndex(x => x.getTitle() == 'Special Cookie Two');
  var special2Count = formValues.findIndex(x => x.getTitle() == 'Special Cookie Two Quantity');
  if (flavors.length) {
    var choices = [];
    for (x in flavors) {
      choices.push(formValues[special1].asListItem().createChoice(flavors[x].name));
    } 
    formValues[special1].asListItem().setRequired(true);
    formValues[special1Count].asTextItem().setRequired(true);
    formValues[special1].asListItem().setChoices(choices);

    formValues[special2].asListItem().setRequired(flavors.length > 1);
    formValues[special2Count].asTextItem().setRequired(flavors.length > 1);
    if (flavors.length > 1) {
      formValues[special2].asListItem().setChoices(choices);
    } else {
      formValues[special2].asListItem().setChoices([
        formValues[special2].asListItem().createChoice('None')
      ]);
    }
  } else {
    formValues[special1].asListItem().setRequired(false);
    formValues[special1Count].asTextItem().setRequired(false);
    formValues[special1].asListItem().setChoices([
      formValues[special1].asListItem().createChoice('None')
    ]);
    formValues[special2].asListItem().setRequired(false);
    formValues[special2Count].asTextItem().setRequired(false);
    formValues[special2].asListItem().setChoices([
      formValues[special2].asListItem().createChoice('None')
    ]);
  }
}

// Update locations and employees list in all forms
function updateLocationsAndEmployees(formId, users) {
  var form = FormApp.openById(formId);
  // Update some formValues from the ss
  var questions = form.getItems();
  var lists = getRange(Sheet.Lists).getValues();

  // Iterate the questions
  for (var index in questions) {
    switch(index) {
      case '0': // Location
        var question = questions[index].asListItem();
        var locations  = [];
        for (var value in lists) {
          if (lists[value][0]) {
            locations.push(question.createChoice(lists[value][0]));
          }
        }
        question.setTitle('Where are you working today?')
          .setChoices(locations)
        break;
      case '1': // Employees  
        var question = questions[index].asListItem();
        var employees = [];
        for (var value in users) {
          if (value > 0 && users[value]) {
            employees.push(question.createChoice(users[value].name));
          }
        }
        question.setChoices(employees);
        break;
    }
  }
}

function testSendNotification() {
  sendNotification('Some subject', 'message Body', NotificationType.Batch);
}

// type = 'batch' or 'inventory'
function sendNotification(subject, body, type) {  
  var recipients = new CUsers().list; 
  recipients.forEach(user => {
    if (user.email) {
      if (user.batchNotifications && type == NotificationType.Batch || user.inventoryNotifications && type == NotificationType.Inventory) {
        MailApp.sendEmail(user.email, subject, body);
      }
    }
  });
  for (index in recipients) {
    if (index > 0 && recipients[index][1]) {
      if ((recipients[index][3] == true && type == NotificationType.Batch) || (recipients[index][4] == true && type == NotificationType.Inventory)) {
        MailApp.sendEmail(recipients[index][1], subject, body);
      }
    }
  }
}

function formSubmitted(e) {
  var sheet = SpreadsheetApp.getActive().getName(); 
  var values = e.values;
  if (updateStock(sheet, values[1])) {
    var subject = 'Batch Completed for (' + sheet + ')';
    var batch = updateBatch(sheet, e.values[1]);
    if (batch) {
      var emailBody = buildBatchCompletedEmail(e.values, batch);
      sendNotification(subject, emailBody, NotificationType.Batch);
      checkStockAlerts();
      buildInstructionsDoc();
    }
  }
}

function buildBatchCompletedEmail(values, batch) {
  var emailBody = 'Completed Batch\n\n';
  var date = new Date();
  emailBody += 'Submitted: ' + date.toLocaleString() + '\n';
  emailBody += 'Location: ' + values[1] + '\n';
  emailBody += 'Employee: ' + values[2] + '\n';
  emailBody += 'Batch Progress: Completed ' + batch[3] + ' of ' + batch[2] + '\n\n';
  var index = 1;
  for (var i = 4; i < values.length; i++) {
    if (values[i]) {
      emailBody += Utilities.formatString('Step %d\n', index++);
      emailBody += values[i] + '\n\n';
    }
  }
  return emailBody;
}

function getRange(name) {
  var wb = SpreadsheetApp.openByUrl(STOCK_WB);
  var sheet = wb.getSheetByName(name);
  return sheet.getDataRange();
}

function getFlavors() {
  var flavors = [];
  var wb = SpreadsheetApp.openByUrl(STOCK_WB);
  var sheet = wb.getSheetByName(Sheet.Flavors);
  var values = sheet.getDataRange().getValues();
  var index = 0;
  for(var value in values) {
    if (value > 0 && values[value][0]) {
      flavors.push(new Flavor(value, values[value])); // { 'name': values[value][0], 'url': values[value][1], 'enabled': values[value][2], 'special': values[value][3] });
    }
  }
  return flavors;
}

function getRecipeFromFormName(formName) {
  var stockSheet = SpreadsheetApp.openByUrl(STOCK_WB);
  var range = stockSheet.getSheetByName('Flavors');
  var values = range.getDataRange().getValues();
  for (index in values) {
    if (values[index][4] && values[index][2] && values[index][4] == formName) {
      return values[index][0];
    }
  }
}

