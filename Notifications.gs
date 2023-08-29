// type = 'batch' or 'inventory'
function sendNotification(subject, body, type) {  
  var recipients = new CUsers().list; 
  // If this is dev version; append -DEV to the subject
  if (beta) {
    subject += ' (Beta Version)'
  }
  recipients.forEach(user => {
    if (user.email) {
      if (user.batchNotifications && type == NotificationType.Batch || user.inventoryNotifications && type == NotificationType.Inventory) {
        MailApp.sendEmail(user.email, subject, body);
      }
    }
  });
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

function sendInventoryReceivedEmail(location, received, employee) {
  var subject = 'Shipment Recieved at ' + location + '\n\n';
  var date = new Date();
  var body = 'Submitted: ' + date.toLocaleString() + '\n';
  body += 'Location: ' + location + '\n';
  body += 'Employee: ' + employee + '\n';
  body += 'Items Received: \n';
  for (item in received) {
    body += Utilities.formatString('%d %s "%s"\n', received[item][1], received[item][2], received[item][0]);
  }
  sendNotification(subject, body, NotificationType.Inventory);
}
