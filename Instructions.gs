function buildTitle(body, styles) {
  
  body.clear();

  var par = body.appendParagraph(beta ? 'Dads Cookies (Beta)' : 'Dads Cookies');
  par.setAttributes(styles.pageTitleStyle);
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

function addLink(body, styles, text, url, withSpacing) {
  par = body.appendParagraph(text);
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = url;
  par.setAttributes(styles.linkStyle)
  if (withSpacing) {
    par.setLineSpacing(2);
  }
}

function getHistoryDates(histories, location, startDate) {
  const month = new Date(startDate).getMonth();
  var day = 31;
  if (month == 0 || month == 9) {
    day = 31;
  } else if (month == 3 || month == 6) {
    day = 30
  }
  const year = new Date(startDate).getFullYear();
  const endDate = new Date(`${month + 3}/${day}/${year}`);
  const data = {'endDate': endDate, 'rows': []};
  data.rows = histories.filter(h => 
    new Date(h.date) >= new Date(startDate)
    && new Date(h.date) <= new Date(endDate)
    && h.location === location
  );
  return data;
}

function addHistoryDetail(docId, styles, histories, location, startDate, ordinal) {
  const body = DocumentApp.openById(getDrive(docId)).getBody();
  buildTitle(body, styles);
  const quarterRows = getHistoryDates(histories, location, startDate);
  addHeader(body, styles, `${location} Daily Counts: ${new Date(startDate).toLocaleDateString('en-us')} to ${new Date(quarterRows.endDate).toLocaleDateString('en-us')}`);
  if (quarterRows.rows.length) {
    var data = {'location': location, 'rows': []};
    quarterRows.rows
      .sort((a,b) => (a.date > b.date) ? 1 : (b.date > a.date) ? -1 : 0)
      .forEach(h => data.rows.push([h.date, h.flavor, h.total]));
    const table = body.appendTable();
    var tr = table.appendTableRow();
    tr.setAttributes(styles.tableHeader);
    tr.appendTableCell('Date');
    tr.appendTableCell('Flavor');
    tr.appendTableCell('Total Count');
    data.rows.forEach(d => {
      tr = table.appendTableRow();
      tr.setAttributes(styles.tableStyle);
      tr.appendTableCell(d[0]);
      tr.appendTableCell(d[1]);
      tr.appendTableCell(Number(d[2]).toFixed(0));
    });
    table.setColumnWidth(1, 300);
  }
}

function addHistory(body, styles, flavors, histories, location, startDate, ordinal, year, detailId) {
  const quarterRows = getHistoryDates(histories, location, startDate);
  if (quarterRows.rows.length) {
    var data = {'location': location, 'rows': []};
    flavors.forEach(f => {
      const filtered = quarterRows.rows.filter(x => x.flavor == f.name);
      if (filtered.length) {
        const sum = filtered
          .map(x => x.total)
          .reduce((a,b) => Number(a) + Number(b));
        if (sum) {
          data.rows.push([f.name, Number(sum).toFixed(0)]);
        }
      }
    });
    if (detailId) {
      addLink(body, styles, `Details for ${ordinal} Quarter`, `${docsRoot}${getDrive(detailId)}`, false);
    }
    const table = body.appendTable();
    var tr = table.appendTableRow();
    tr.setAttributes(ordinal == 'Current' ? styles.tableHeaderCurrent : styles.tableHeader);
    tr.appendTableCell(`${location} ${ordinal} Quarter (${year})`);
    tr.appendTableCell(`${new Date(startDate).toLocaleDateString('en-us')} to ${new Date(quarterRows.endDate).toLocaleDateString('en-us')}`);
    data.rows.forEach(d => {
      tr = table.appendTableRow();
      tr.setAttributes(styles.tableStyle);
      tr.appendTableCell(d[0]);
      tr.appendTableCell(d[1]);
    });
  }
}

function buildInstructionsDoc() {
  const flavors = new CFlavors().list.sort((a,b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0);
  const stock = new CStock().list.sort((a,b) => (a.name > b.name) ? 1 : (b.anme > a.name) ? -1 : 0);
  const locations = getLocations();

  var styles = {
    'pageTitleStyle': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#0F5180', 
      [DocumentApp.Attribute.FONT_SIZE]: 22 
    },
    'titleStyle': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#000000', 
      [DocumentApp.Attribute.FONT_SIZE]: 22 
    },
    'headerStyle': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#000000', 
      [DocumentApp.Attribute.FONT_SIZE]: 16 
    },
    'textStyle': { 
      [DocumentApp.Attribute.BOLD]: false, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#000000', 
      [DocumentApp.Attribute.FONT_SIZE]: 12 
    },
    'linkStyle': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FONT_SIZE]: 12 
    },
    'tableHeader': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#0B6FB8', 
      [DocumentApp.Attribute.FONT_SIZE]: 12 
    },
    'tableHeaderCurrent': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#AE1161', 
      [DocumentApp.Attribute.FONT_SIZE]: 12 
    },
    'tableStyle': { 
      [DocumentApp.Attribute.BOLD]: true, 
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#000000', 
      [DocumentApp.Attribute.FONT_SIZE]: 10 
    }
  };

  var body = DocumentApp.openById(getDrive(DriveName.Instructions)).getBody();
  buildTitle(body, styles);

  addHeader(body, styles, 'Batch Mix Instructions');
  flavors.forEach(flavor => {
    if (flavor.enabled) {
      styles.linkStyle[DocumentApp.Attribute.LINK_URL] = `${formsRoot}${flavor.formId}/viewform`;
      par = body.appendParagraph(flavor.name);
      par.setAttributes(styles.linkStyle);
      par.setLineSpacing(2);
    }
  });

  addHeader(body, styles, 'Inventory and Batch Summaries');
  addLink(body, styles, 'Daily Batch Progress', `${docsRoot}${getDrive(DriveName.DailyBatchProgress)}`, true);
  addLink(body, styles, 'Frozen Inventory', `${docsRoot}${getDrive(DriveName.FrozenInventory)}`, true);
  addLink(body, styles, 'Raw Inventory', `${docsRoot}${getDrive(DriveName.RawInventory)}`, true);
  addLink(body, styles, 'Batch Production History', `${docsRoot}${getDrive(DriveName.BatchHistoryDoc)}`, true);

  const batchBody = DocumentApp.openById(getDrive(DriveName.DailyBatchProgress)).getBody();
  buildTitle(batchBody, styles);

  // Build the daily batch doc
  addHeader(batchBody, styles, 'Daily Batch Progress');

  var progress = new CBatches().list;
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
  const frozen = new CFrozen().list.sort((a,b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0);
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

  // Build the batch history page
  const historyBody = DocumentApp.openById(getDrive(DriveName.BatchHistoryDoc)).getBody();
  buildTitle(historyBody, styles);
  const histories = new CHistory().list;
  const today = new Date();
  const year = today.getFullYear();
  var month = today.getMonth();
  if (month < 4) {
    month = 1;
  } else if (month < 7) {
    month = 4;
  } else if (month < 10) {
    month = 7;
  } else {
    month = 10;
  }
  locations.forEach(l => {
    addHeader(historyBody, styles, `Production  for ${l}`);

    const currentQuarter  = `${month}/1/${year}`;
    const firstQuarter = `1/1/${month > 3 ? year : year - 1 }`;
    const secondQuarter = `4/1/${month > 6 ? year : year - 1 }`;
    const thirdQuarter = `7/1/${month > 9 ? year : year - 1 }`;
    const fourthQuarter = `10/1/${month >= 12 ? year : year - 1 }`;

    addHistory(historyBody, styles, flavors, histories, l, currentQuarter, 'Current', year, l == 'Fresno' ? DriveName.BatchHistoryDetail0Doc : null);
    addHistory(historyBody, styles, flavors, histories, l, firstQuarter, '1st', month > 3 ? year : year - 1, l == 'Fresno' ? DriveName.BatchHistoryDetail1Doc : null);
    addHistory(historyBody, styles, flavors, histories, l, secondQuarter, '2nd', month > 3 ? year : year - 1, l == 'Fresno' ? DriveName.BatchHistoryDetail2Doc : null);
    addHistory(historyBody, styles, flavors, histories, l, thirdQuarter, '3rd', month > 3 ? year : year - 1, l == 'Fresno' ? DriveName.BatchHistoryDetail3Doc : null);
    addHistory(historyBody, styles, flavors, histories, l, fourthQuarter, '4th', month > 3 ? year : year - 1, l == 'Fresno' ? DriveName.BatchHistoryDetail4Doc : null);
    if (l == 'Fresno') {
      addHistoryDetail(DriveName.BatchHistoryDetail0Doc, styles, histories, l, currentQuarter, 'Current');      
      addHistoryDetail(DriveName.BatchHistoryDetail1Doc, styles, histories, l, firstQuarter, '1st');      
      addHistoryDetail(DriveName.BatchHistoryDetail2Doc, styles, histories, l, secondQuarter, '2nd');      
      addHistoryDetail(DriveName.BatchHistoryDetail3Doc, styles, histories, l, thirdQuarter, '3rd');      
      addHistoryDetail(DriveName.BatchHistoryDetail4Doc, styles, histories, l, fourthQuarter, '4th');      
    }
    
    historyBody.appendPageBreak();

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

  par = body.appendParagraph('Manual Inventory Form');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = `${formsRoot}${getDrive(DriveName.ManualInventoryFormClient)}/viewform`;
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);

  addHeader(body, styles, 'Management');

  par = body.appendParagraph('Shipment Received');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.ShippingReceivedWb);
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);
  
  par = body.appendParagraph('Manual Inventory');
  styles.linkStyle[DocumentApp.Attribute.LINK_URL] = getDrive(DriveName.ManualInventory);
  par.setAttributes(styles.linkStyle)
  par.setLineSpacing(2);
}