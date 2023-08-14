function buildInstructionsDoc() {
  var doc = DocumentApp.openById(getDocumentId(Form.Instructions));
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

  var flavors = new CFlavors();
  flavors.list.forEach(flavor => {
    if (flavor.enabled) {
      linkStyle[DocumentApp.Attribute.LINK_URL] = flavor.form;
      par = body.appendParagraph(flavor.name);
      par.setAttributes(linkStyle);
      par.setLineSpacing(2);
    }
  });

  par = body.appendParagraph('Daily Batch Progress');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5);

  var progress = new CBatches().list; // Stock.getRange('Batches').getValues();
  var tableData = [];
  tableData.push(['Name', 'Location', 'Completed', 'Goal']);
  progress.forEach(p => {
    flavors.list.forEach(flavor => {
      if (flavor.name == p.name && flavor.enabled) {
        const row = [p.name, p.location, p.completed, p.goal];
        tableData.push(row);
      }
    })
  });
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

  var stock = new CStock().list;
  var fresnoStock = [];
  fresnoStock.push(['Ingredient', 'Amount']);
  var lemooreStock = [];
  lemooreStock.push(['Ingredient', 'Amount']);
  stock.forEach(s => {
    var item = [s.name, Utilities.formatString('%01.3f %s', s.amount, s.uom)];
    if (s.location === 'Fresno') {
      fresnoStock.push(item);
    } else {
      lemooreStock.push(item);
    }
  });
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