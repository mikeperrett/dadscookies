const version = PropertiesService.getScriptProperties().getProperty('version');
const STOCK_WB = 'https://docs.google.com/spreadsheets/d/1-_Qob4UiwEByJKeyodi6zDfrJnojNUUYB9NPK-cNZqU/edit';
const STOCK_WB_DEV = 'https://docs.google.com/spreadsheets/d/18QUKlSsKupDOwgjvQ-BwHDUzX-ufEYpvnW2rZU5TEB4/edit';

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
  SpecialCookieTwo: 'SpecialCookieTwo',
  Instructions: 'Instructions'
}

const Scripts = {
  Instructions: '1kk9DwSGdk9kW0shZrKhXb9qqdCALqxyUXYamsC__sT7N86IH1gHtPKdn'
}

function getSpreadsheet() {
  if (version == '0') {
    return STOCK_WB_DEV;
  }
  return STOCK_WB;
}

function getDocumentId(name) {
  if (version == '0') {
    // Dev documents
    switch (name) {
      case Form.ClassicChocolateChip: return '1Jy7C8YHgSmgqr2nDYRMmSWMs56LCusxj7zjQ7t9_6V0';
      case Form.CookiesNCream: return '1v4EYH9AbYhfIdgN9XHQ9sWoFIulLGFFo9msM9Fp43WU';
      case Form.CakeBatter: return '1Lky99RutyC3GLI80kfDUBm9774Fk6FsYNw3Xf49wPi4';
      case Form.Snickerdoodle: return '1eInWUVBE-7pXEGUX7LCxaRoi--XaUqjsVWFPMHrmHkE';
      case Form.PeanutButterChocolateChip: return '1SWXIL5oIwjRTGWj3FzkQowigXzMyPPoYn9b_BQizBfQ';
      case Form.ChocolatePeanutButterChip: return '1n1OwY6q9BDkUb8PrD_qYFiWdZuX-Zpmb7dHeiT2hHeM';
      case Form.OatmealChocolateChip: return '1-xGA3nAGfg0j8QnryY5yGNuw2mjvCM_2g0aiCAL1yQI';
      case Form.OatmealRaisin: return '1QYBymJO5PIHf1wRHcv57NqUWotM_i2QpCaQAVSBxZQI';
      case Form.SpecialCookieOne: return '13EY_FRoaChO6oi6TcLNrXLsjS9u47QWAB_TjvT-TtBU';
      case Form.SpecialCookieTwo: return '1oxC2x0_ZiqCgaVYzGbtQ-KcQ8KAOzWaM0O8fCxD5K8o';
      case Form.CookieCounter: return '1LGhaUbGJgqPzrM3IoV9AZXl54YAwYKTtekR1-fuVrrQ';
      case Form.ShipmentRecievedDesktop: return '1GcBDH5xfgMC3ivkHEA4C-FacedbWwX-V1YKhSTIgdQw';
      case Form.ShipmentReceivedMobile: return '17H7waNlHMwgNn-fUFY2cy7BdvlgMKz0bRRT3FNX_0KY';
      case Form.Instructions: return '1cDix6Q9BBhXadZMinHUihUAytfCxrHA58AaPNpUhbQw';
    }
  } else {
    // Production documents
    switch (name) {
      case Form.ClassicChocolateChip: return '1L8OT7CsMQNwNc-8ZU2VohK0P7o02xleb7sfJ70qRfv8';
      case Form.CookiesNCream: return '1y1joj74-G4VN5b24yIONNi_U2Bt2g1RKT5vWx_aDcgI';
      case Form.CakeBatter: return '1dZt56rIYQi1JsYpeKq7mKMJ0N871-DRBcSSI2HNnaGo';
      case Form.Snickerdoodle: return '1HIObZDu84OzgZikAUnjygnuuPBL-3xrzlgBGoVlMi_c';
      case Form.PeanutButterChocolateChip: return '1IAqe6nn3Fzpz5L6P6BJ7naK6MxQ4g9FBlsqM3TEJNWg';
      case Form.ChocolatePeanutButterChip: return '1ptuRAXSorQMdL_AX9QTyd14fc7gQ_8XcwsQK3di_yNc';
      case Form.OatmealChocolateChip: return '1UxWoHprHywy9kg1t7_rbk_K23Ge2K8ZDQ3tvvYhvONU';
      case Form.OatmealRaisin: return '1qiss8IZCtYBA-FWUcYFYgYgUK3c-pfsdt81QLUsjg2U';
      case Form.SpecialCookieOne: return '1iUJezM6gziCGkDSzcO4HPsWvMVbcyy9nQBH7TFcM2IA';
      case Form.SpecialCookieTwo: return '1WK8NEaiLbEOTDDUwPWKrjxhIY6ocUjKXSuqgjqAl38A';
      case Form.CookieCounter: return '1ImDLQuuR5BdacaLSedMpF4uLvrOMwpq7he1mXVnb7c8';
      case Form.ShipmentRecievedDesktop: return '1-x1QNOMd9YnawMjbUbT7sAsTCyV0DQ0rkDhu5J19rAY';
      case Form.ShipmentReceivedMobile: return '1yVJStpXYfMnCk4xpYNZczBk66hrUiD-wPF8GQAa5wKc';
      case Form.Instructions: return '1g9ogRragAO1qg4WghPGyZS-9Xm9ROYU0zqSpYRbFCs4';
    }
  }
}

function getVersion() {
  return PropertiesService.getScriptProperties().getProperty('version');
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
  return ContentService.createTextOutput('Version: ' + version);
//   return HtmlService.createHtmlOutputFromFile('index');
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
  const form = FormApp.openById(getDocumentId(Form.ShipmentReceivedMobile));
  var data = new CStock().list;
  var ingredients = [];
  for (x in data) {
    if (data[x].location == 'Fresno') {
      ingredients.push(data[x].name)
    }
  }
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
  var users = (new CUsers(Sheet.Users).list).sort((x, y) => x - y );
  updateLocationsAndEmployees(getDocumentId(Form.ClassicChocolateChip), users);
  updateLocationsAndEmployees(getDocumentId(Form.CookiesNCream), users);
  updateLocationsAndEmployees(getDocumentId(Form.CakeBatter), users);
  updateLocationsAndEmployees(getDocumentId(Form.Snickerdoodle), users);
  updateLocationsAndEmployees(getDocumentId(Form.PeanutButterChocolateChip), users);
  updateLocationsAndEmployees(getDocumentId(Form.ChocolatePeanutButterChip), users);
  updateLocationsAndEmployees(getDocumentId(Form.OatmealChocolateChip), users);
  updateLocationsAndEmployees(getDocumentId(Form.OatmealRaisin), users);
  updateLocationsAndEmployees(getDocumentId(Form.CookieCounter), users);
  updateLocationsAndEmployees(getDocumentId(Form.SpecialCookieOne), users);
  updateLocationsAndEmployees(getDocumentId(Form.SpecialCookieTwo), users);
  updateLocationsAndEmployees(getDocumentId(Form.ShipmentReceivedMobile), users);
  
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
        updateSpecialCookie(getDocumentId(Form.SpecialCookieOne), data);
      } else if (flavor.formName == Form.SpecialCookieTwo) {
        updateSpecialCookie(getDocumentId(Form.SpecialCookieTwo), data);
      }
    }
  }
}

function testGetSpecials() {
  getSpecials().forEach(x => {
    Logger.log(`${x.name}, Form: ${x.formName}, Batch Yield: ${x.yield}`);
  });
}

function getSpecials() {
  return new CFlavors().list.filter(x => x.enabled && x.special);
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

function testUpdateCookieCounter() {
  updateCookieCounter(getSpecials());
}

function updateCookieCounter(flavors) {
  var form = FormApp.openById(getDocumentId(Form.CookieCounter));
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

function buildBatchCompletedEmail(values, batch) {
  var emailBody = 'Completed Batch\n\n';
  var date = new Date();
  emailBody += 'Submitted: ' + date.toLocaleString() + '\n';
  emailBody += 'Location: ' + values[1] + '\n';
  emailBody += 'Employee: ' + values[2] + '\n';
  emailBody += 'Batch Progress: Completed ' + batch.completed + ' of ' + batch.goal + '\n\n';
  var index = 1;
  for (var i = 4; i < values.length; i++) {
    if (values[i]) {
      emailBody += Utilities.formatString('Step %d\n', index++);
      emailBody += values[i] + '\n\n';
    }
  }
  return emailBody;
}

function testGetRange() {
  const users = new CUsers().list.forEach(u => { Logger.log(u.name)});
}

function getRange(name) {
  var wb = SpreadsheetApp.openByUrl(getSpreadsheet());
  var sheet = wb.getSheetByName(name);
  return sheet.getDataRange();
}

