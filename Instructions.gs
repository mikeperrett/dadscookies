function buildInstructionsDoc() {
  var doc = DocumentApp.openById(getDrive(DriveName.Instructions));
  var body = doc.getBody();
  body.clear();

  var titleStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 22 };
  var headerStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 16 };
  var textStyle = { [DocumentApp.Attribute.BOLD]: false, [DocumentApp.Attribute.FONT_SIZE]: 12 };
  var linkStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 12 };
  var tableStyle = { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 10 };

  var par = body.appendParagraph((version == '0') ? 'Dads Cookies (Beta Version)' : 'Dads Cookies');
  par.setAttributes(titleStyle);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  par = body.appendParagraph(new Date().toLocaleString());
  par.setAttributes(textStyle);
  par.setLineSpacing(3);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);


  par = body.appendParagraph('Batch Mix Instructions');
  par.setAttributes(headerStyle);
  par.setLineSpacing(1.5);

  const flavors = new CFlavors().list;
  flavors.forEach(flavor => {
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
    flavors.forEach(flavor => {
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
  linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.CookieCounterLink);
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received (Desktop)');
  linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.ShippingReceivedWb);
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received (mobile)');
  linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.ShipmentReceivedMobileLink);
  par.setAttributes(linkStyle)
  par.setLineSpacing(2);

  const stock = new CStock().list;
  const locations = getLocations();
  locations.forEach(l => {
    var location = {'location': l, 'data': []};
    location.data.push(['Ingredient', 'Amount']);
    stock.forEach(s => {
      if (l == s.location) {
        var item = [s.name, Utilities.formatString('%01.3f %s', s.amount, s.uom)];
        location.data.push(item);
      }
    });
    par = body.appendParagraph(`Raw Ingredients Inventory (${l})`);
    par.setAttributes(headerStyle);
    par.setLineSpacing(1.5); 

    const table = body.appendTable(location.data);
    table.setAttributes(tableStyle);
    table.setColumnWidth(0, 300);
  });

  const frozen = new CFrozen().list;
  locations.forEach(l => {
    var location = {'location': l, 'data': []};
    location.data.push(['Flavor', 'Count']);
    frozen.forEach(f => {
      if (l == f.location) {
        // Is the flavor enabled?
        const flavor = flavors.find(x => x.enabled && x.name == f.name);
        if (flavor) {
          var item = [f.name, Utilities.formatString('%d', f.count)];
          location.data.push(item);
        }
      }
    });
    par = body.appendParagraph(`Frozen Inventory (${l})`);
    par.setAttributes(headerStyle);
    par.setLineSpacing(1.5); 

    const table = body.appendTable(location.data);
    table.setAttributes(tableStyle);
    table.setColumnWidth(0, 300);
  });
}