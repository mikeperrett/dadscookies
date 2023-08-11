function buildInstructionsDoc() {
  var doc = DocumentApp.openById('1g9ogRragAO1qg4WghPGyZS-9Xm9ROYU0zqSpYRbFCs4');
  var body = doc.getBody();
  body.clear();

  var titleStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 22 };
  var headerStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 16 };
  var textStyle = { [DocumentApp.Attribute.BOLD]: false, [DocumentApp.Attribute.FONT_SIZE]: 12 };
  var linkStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 12 };
  var tableStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 10 };

  var par = body.appendParagraph('Dads Cookies');
  par.setAttributes(titleStyle);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  par = body.appendParagraph(new Date().toLocaleString());
  par.setAttributes(textStyle);
  par.setLineSpacing(3);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);


  par = body.appendParagraph('Batch Mix Instructions');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5);

  var flavors = getFlavors();
  for(var index in flavors) {
    var batch = flavors[index];
    var name = batch.name;
    if (batch.enabled) {
      linkStyle[DocumentApp.Attribute.LINK_URL] = batch.form;
      par = body.appendParagraph(name);
      par.setAttributes(linkStyle);
      par.setLineSpacing(2);
    } else {
      // name += ' (disabled)';
      // par = body.appendParagraph(name);
      // par.setLineSpacing(2);
    }
  }

  par = body.appendParagraph('Daily Batch Progress');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5);

  var progress = getBatches().list; // Stock.getRange('Batches').getValues();
  var tableData = [];
  tableData.push(['Name', 'Location', 'Completed', 'Goal']);
  for (b in progress) {
    for (f in flavors) {
      if (flavors[f].name == progress[b].name && flavors[f].enabled) {
        var row = [progress[b].name, progress[b].location, progress[b].completed, progress[b].goal];
        tableData.push(row);
        break;
      }
    }
  }
  var table = body.appendTable(tableData);
  table.setAttributes(tableStyle);
  table.setColumnWidth(0, 300);

  par = body.appendParagraph('Inventory');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5);

  par = body.appendParagraph('Frozen Cookie Count Inventory Form');
  linkStyle[DocumentApp.Attribute.LINK_URL] = 'https://forms.gle/tpA4pUBriFzwtL719';
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received (Desktop)');
  linkStyle[DocumentApp.Attribute.LINK_URL] = 'https://docs.google.com/spreadsheets/d/1-x1QNOMd9YnawMjbUbT7sAsTCyV0DQ0rkDhu5J19rAY';
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received (mobile)');
  linkStyle[DocumentApp.Attribute.LINK_URL] = 'https://forms.gle/Kp7H9kHZRzkRgjxa7';
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Raw Ingredients Inventory (Fresno)');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5); 

  var stock = getStock().list;
  var fresnoStock = [];
  fresnoStock.push(['Ingredient', 'Amount']);
  var lemooreStock = [];
  lemooreStock.push(['Ingredient', 'Amount']);
  for(s in stock) {
    var item = [stock[s].name, Utilities.formatString('%01.3f %s', stock[s].amount, stock[s].uom)];
    if (stock[s].location === 'Fresno') {
      fresnoStock.push(item);
    } else {
      lemooreStock.push(item);
    }
  }
  var table = body.appendTable(fresnoStock);
  table.setAttributes(tableStyle);
  table.setColumnWidth(0, 300);

  par = body.appendParagraph('Raw Ingredients Inventory (Lemoore)');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5); 
  
  table = body.appendTable(lemooreStock);
  table.setAttributes(tableStyle);
  table.setColumnWidth(0, 300);
}