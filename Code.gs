const released = PropertiesService.getScriptProperties().getProperty('version');
const current = 37;
const beta = current > released;
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

const DriveType = {
  Spreadsheet: 0,
  Form: 1
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
  Users: 'Users',
  History: 'History'
}

const DriveName = {
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
  Instructions: 'Instructions',
  Stock: 'Stock',
  CookieCounter: 'CookieCounter',
  CookieCounterClient: 'CookieCounterClient',
  ShipmentRecievedDesktop: 'ShipmentReceivedDesktop',
  ShipmentReceivedMobile: 'ShipmentReceived',
  ShipmentReceivedMobileClient: 'ShipmentReceivedClient',
  ShippingReceivedWb: 'ShippingReceivedWb',
  RawInventory: 'RawInventory',
  FrozenInventory: 'FrozenInventory',
  DailyBatchProgress: 'DailyBatchProgress',
  ManualInventory: 'ManualInventory',
  ManualInventoryForm: 'ManualInventoryForm',
  ManualInventoryFormClient: 'ManualInventoryFormClient',
}

function getDrive(name) {
  if (beta) {
    // Dev documents
    switch (name) {
      case DriveName.ClassicChocolateChip: return '1Jy7C8YHgSmgqr2nDYRMmSWMs56LCusxj7zjQ7t9_6V0';
      case DriveName.CookiesNCream: return '1v4EYH9AbYhfIdgN9XHQ9sWoFIulLGFFo9msM9Fp43WU';
      case DriveName.CakeBatter: return '1Lky99RutyC3GLI80kfDUBm9774Fk6FsYNw3Xf49wPi4';
      case DriveName.Snickerdoodle: return '1eInWUVBE-7pXEGUX7LCxaRoi--XaUqjsVWFPMHrmHkE';
      case DriveName.PeanutButterChocolateChip: return '1SWXIL5oIwjRTGWj3FzkQowigXzMyPPoYn9b_BQizBfQ';
      case DriveName.ChocolatePeanutButterChip: return '1n1OwY6q9BDkUb8PrD_qYFiWdZuX-Zpmb7dHeiT2hHeM';
      case DriveName.OatmealChocolateChip: return '1-xGA3nAGfg0j8QnryY5yGNuw2mjvCM_2g0aiCAL1yQI';
      case DriveName.OatmealRaisin: return '1QYBymJO5PIHf1wRHcv57NqUWotM_i2QpCaQAVSBxZQI';
      case DriveName.SpecialCookieOne: return '13EY_FRoaChO6oi6TcLNrXLsjS9u47QWAB_TjvT-TtBU';
      case DriveName.SpecialCookieTwo: return '1oxC2x0_ZiqCgaVYzGbtQ-KcQ8KAOzWaM0O8fCxD5K8o';
      case DriveName.CookieCounter: return '1LGhaUbGJgqPzrM3IoV9AZXl54YAwYKTtekR1-fuVrrQ';
      case DriveName.CookieCounterClient: return '1FAIpQLScvlogtKjI4m-lDgXn3esJE1uRxIbyuyH8AzBtnQ2pOXq6ivA';
      case DriveName.ShipmentRecievedDesktop: return '1GcBDH5xfgMC3ivkHEA4C-FacedbWwX-V1YKhSTIgdQw';
      case DriveName.ShipmentReceivedMobile: return '17H7waNlHMwgNn-fUFY2cy7BdvlgMKz0bRRT3FNX_0KY';
      case DriveName.ShipmentReceivedMobileClient: return '1FAIpQLSfVUjVDZXvJ90HTMTJab_klWEsiyQ-9rY7mC9mtlcT5V4xgjA';
      case DriveName.Instructions: return '1cDix6Q9BBhXadZMinHUihUAytfCxrHA58AaPNpUhbQw';
      case DriveName.ShippingReceivedWb: return 'https://docs.google.com/spreadsheets/d/1GcBDH5xfgMC3ivkHEA4C-FacedbWwX-V1YKhSTIgdQw';
      case DriveName.Stock: return 'https://docs.google.com/spreadsheets/d/18QUKlSsKupDOwgjvQ-BwHDUzX-ufEYpvnW2rZU5TEB4/edit';
      case DriveName.RawInventory: return '1m8lhEwUZT204PZ3J942UzzCyyv6BpsWdfLrAGtK0YnU';
      case DriveName.FrozenInventory: return '1hIaWOKvxEchqB_uSu74JVqxZdPSthe92i8M5DnMka88';
      case DriveName.DailyBatchProgress: return '15W_orlUMLPOTeXbVxaKOEQ5tf-MfOnnGqlfNXeNbC9s';
      case DriveName.ManualInventory: return 'https://docs.google.com/spreadsheets/d/1wIOjXWdxDPFQaK8cAA0mRFOl1jIXLJdQTWiowvJBDwA';
      case DriveName.ManualInventoryForm: return '1LilmK5Vxgm5ZF2ELPNNL8a3xGNuPV7sHpomleCsWTrU';
      case DriveName.ManualInventoryFormClient: return '1FAIpQLSc8xGAKIJjR-eGqzKBxAYrnxlCpvGJDvdclZhdXgQ9hNVul0Q';
    }
  } else {
    // Production documents
    switch (name) {
      case DriveName.ClassicChocolateChip: return '1L8OT7CsMQNwNc-8ZU2VohK0P7o02xleb7sfJ70qRfv8';
      case DriveName.CookiesNCream: return '1y1joj74-G4VN5b24yIONNi_U2Bt2g1RKT5vWx_aDcgI';
      case DriveName.CakeBatter: return '1dZt56rIYQi1JsYpeKq7mKMJ0N871-DRBcSSI2HNnaGo';
      case DriveName.Snickerdoodle: return '1HIObZDu84OzgZikAUnjygnuuPBL-3xrzlgBGoVlMi_c';
      case DriveName.PeanutButterChocolateChip: return '1IAqe6nn3Fzpz5L6P6BJ7naK6MxQ4g9FBlsqM3TEJNWg';
      case DriveName.ChocolatePeanutButterChip: return '1ptuRAXSorQMdL_AX9QTyd14fc7gQ_8XcwsQK3di_yNc';
      case DriveName.OatmealChocolateChip: return '1UxWoHprHywy9kg1t7_rbk_K23Ge2K8ZDQ3tvvYhvONU';
      case DriveName.OatmealRaisin: return '1qiss8IZCtYBA-FWUcYFYgYgUK3c-pfsdt81QLUsjg2U';
      case DriveName.SpecialCookieOne: return '1iUJezM6gziCGkDSzcO4HPsWvMVbcyy9nQBH7TFcM2IA';
      case DriveName.SpecialCookieTwo: return '1WK8NEaiLbEOTDDUwPWKrjxhIY6ocUjKXSuqgjqAl38A';
      case DriveName.CookieCounter: return '1ImDLQuuR5BdacaLSedMpF4uLvrOMwpq7he1mXVnb7c8';
      case DriveName.CookieCounterClient: return '1FAIpQLSfNDIkgsvOYEFEn6Jffsi-HuQXNXSbsT7bLOeVek_SXWlV7gA';
      case DriveName.ShipmentRecievedDesktop: return '1-x1QNOMd9YnawMjbUbT7sAsTCyV0DQ0rkDhu5J19rAY';
      case DriveName.ShipmentReceivedMobile: return '1yVJStpXYfMnCk4xpYNZczBk66hrUiD-wPF8GQAa5wKc';
      case DriveName.ShipmentReceivedMobileClient: return '1FAIpQLSfcm6CFK2hrJBKQLxjfwZo_NzXFnQNh_mUG1uaW8kvvcFocpw';
      case DriveName.Instructions: return '1g9ogRragAO1qg4WghPGyZS-9Xm9ROYU0zqSpYRbFCs4';
      case DriveName.ShippingReceivedWb: return 'https://docs.google.com/spreadsheets/d/1-x1QNOMd9YnawMjbUbT7sAsTCyV0DQ0rkDhu5J19rAY';
      case DriveName.Stock: return 'https://docs.google.com/spreadsheets/d/1-_Qob4UiwEByJKeyodi6zDfrJnojNUUYB9NPK-cNZqU/edit';
      case DriveName.RawInventory: return '1Tf-bSkhjXMsT33wlWatRKVGmjqwDRMSc8ZsT2mA-pMM';
      case DriveName.FrozenInventory: return '1DsBU3sLgsf4Dln6V8y2OoTGrC9iWyag1bxk56azIsxg';
      case DriveName.DailyBatchProgress: return '1U2ajW0PVqSfNxBUdudpsJFp6hPtTeVNcf5EnAYv4U1Q';
      case DriveName.ManualInventory: return 'https://docs.google.com/spreadsheets/d/1JTBV5dN-WeNPCH3MsjXHZDR0jG58yVoOoPZOcHLlCUQ';
      case DriveName.ManualInventoryForm: return '14QDyafFw_R99wfhLiMUNcP_JAv_gBHk3qEVxjrgj_ic';
      case DriveName.ManualInventoryFormClient: return '1FAIpQLSdzVFEH7dscHA-7AFrKcqBHGUyUgXU98_vvHHQTNwe2DJSOAA';
    }
  }
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
  return ContentService.createTextOutput(`Released ${released}, Current: ${current}(${beta ? 'Beta' : 'Released'})`);
//   return HtmlService.createHtmlOutputFromFile('index');
}

function testGetLocations() {
  const locations = getLocations();
  locations.forEach(l => Logger.log(l));
}

function getLocations() {
  var lists = getRange(Sheet.Lists).getValues();
  var locations = [];
  lists.forEach(l => {
    if (l[0]) {
      locations.push(l[0]);
    }
  });
  return locations.sort((a,b) => (a > b) ? 1 : (b > a) ? -1 : 0);
}

function getSpecials() {
  return new CFlavors().list.filter(x => x.enabled && x.special);
}

function testGetRange() {
  const users = new CUsers().list.forEach(u => { Logger.log(u.name)});
}

function getSheet(name) {
  var wb = SpreadsheetApp.openByUrl(getDrive(DriveName.Stock));
  return wb.getSheetByName(name);
}

function getRange(name) {
  var sheet = getSheet(name);
  return sheet.getDataRange();
}

