function buildTitle(body, styles) {
  body.clear();

  var par = body.appendParagraph(beta ? 'Dads Cookies (Beta)' : 'Dads Cookies');
  par.setAttributes(styles.titleStyle);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  const date = new Date().toLocaleString();
  par = body.appendParagraph(`${date} - Version ${current}`);
  par.setAttributes(styles.textStyle);
  par.setLineSpacing(3);
  par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function addHeader(body, styles, text) {
  par = body.appendParagraph(text);
  par.setAttributes(styles.headerStyle);
  par.setLineSpacing(1.5);
}

function addLink(body, styles, text, url) {
  par = body.appendParagraph(text);
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = url;
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);

}

function buildInstructionsDoc() {
  const docsRoot = 'https://docs.google.com/document/d/';
  const formsRoot = 'https://docs.google.com/forms/d/e/'; // ${id}/viewform?usp=sf_link';
  const flavors = new CFlavors().list;
  const stock = new CStock().list;
  const locations = getLocations();

  var styles = {
    'titleStyle': { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 22 },
    'headerStyle': { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 16 },
    'textStyle': { [DocumentApp.Attribute.BOLD]: false, [DocumentApp.Attribute.FONT_SIZE]: 12 },
    'linkStyle': { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 12 },
    'tableStyle': { [DocumentApp.Attribute.BOLD]: true, [DocumentApp.Attribute.FONT_SIZE]: 10 }
  };

  var body = DocumentApp.openById(getDrive(DriveName.Instructions)).getBody();
  buildTitle(body, styles);

  addHeader(body, styles, 'Batch Mix Instructions');
  flavors.forEach(flavor => {
    if (flavor.enabled) {
      styles.linkStyle[DocumentApp.Attribute.LINK_URL] = flavor.form;
      par = body.appendParagraph(flavor.name);
      par.setAttributes(styles.linkStyle);
      par.setLineSpacing(2);
    }
  });

  addHeader(body, styles, 'Inventory and Batch Summaries');
  addLink(body, styles, 'Daily Batch Progress', `${docsRoot}${getDrive(DriveName.DailyBatchProgress)}`);
  addLink(body, styles, 'Frozen Inventory', `${docsRoot}${getDrive(DriveName.FrozenInventory)}`);
  addLink(body, styles, 'Raw Inventory', `${docsRoot}${getDrive(DriveName.RawInventory)}`);

  const batchBody = DocumentApp.openById(getDrive(DriveName.DailyBatchProgress)).getBody();
  buildTitle(batchBody, styles);

  // Build the daily batch doc
  addHeader(batchBody, styles, 'Daily Batch Progress');

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
  var table = batchBody.appendTable(tableData);
  table.setAttributes(styles.tableStyle);
  table.setColumnWidth(0, 300);

  // Build the daily batch doc
  const frozenBody = DocumentApp.openById(getDrive(DriveName.FrozenInventory)).getBody();
  buildTitle(frozenBody, styles);
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
    par = frozenBody.appendParagraph(`Frozen Inventory (${l})`);
    par.setAttributes(styles.headerStyle);
    par.setLineSpacing(1.5); 

    const table = frozenBody.appendTable(location.data);
    table.setAttributes(styles.tableStyle);
    table.setColumnWidth(0, 300);
  });

  // Build the raw inventory page
  const rawBody = DocumentApp.openById(getDrive(DriveName.RawInventory)).getBody();
  buildTitle(rawBody, styles);
  locations.forEach(l => {
    var location = {'location': l, 'data': []};
    location.data.push(['Ingredient', 'Amount']);
    stock.forEach(s => {
      if (l == s.location) {
        var item = [s.name, Utilities.formatString('%01.3f %s', s.amount, s.uom)];
        location.data.push(item);
      }
    });
    par = rawBody.appendParagraph(`Raw Ingredients Inventory (${l})`);
    par.setAttributes(styles.headerStyle);
    par.setLineSpacing(1.5); 

    const table = rawBody.appendTable(location.data);
    table.setAttributes(styles.tableStyle);
    table.setColumnWidth(0, 300);
  });

  addHeader(body, styles, 'Inventory Input Forms');

  par = body.appendParagraph('Frozen Cookie Count Inventory Form');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = `${formsRoot}${getDrive(DriveName.CookieCounterClient)}/viewform`;
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received Form');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = `${formsRoot}${getDrive(DriveName.ShipmentReceivedMobileClient)}/viewform`;
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);

  par = body.appendParagraph('Shipment Received (Managerial)');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.ShippingReceivedWb);
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);
  
}