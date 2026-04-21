/**
 * Google Apps Script to handle POST requests from the Quiz Form
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste THIS code.
 * 4. Click 'Deploy' > 'New Deployment'.
 * 5. Select type: 'Web App'.
 * 6. Set access: 'Anyone'.
 * 7. Authorize the script and copy the 'Web App URL'.
 */

function doPost(e) {
  try {
    // 1. Capture data from either JSON body or Form parameters
    let data = {};
    if (e.parameter && e.parameter.fullName) {
      data = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (f) { data = e.parameter; }
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // 2. Select sheet based on 'sheetName' parameter (default to 'Sheet1')
    const sheetName = data.sheetName || "Sheet1";
    let sheet = ss.getSheetByName(sheetName);
    
    // Create the sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // 3. Handle data based on sheet type
    // Clean name for comparison (Sheet1 vs Sheet2, case-insensitive, no spaces)
    const cleanSheetName = sheetName.replace(/\s+/g, '').toLowerCase();

    if (cleanSheetName === "sheet2" || data.subject || data.message) {
      // CONTACT FORM LOGIC (Sheet 2)
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Full Name", "Email", "Subject", "Message"]);
        sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#3b3500").setFontColor("#ffffff");
      }
      sheet.appendRow([
        new Date().toLocaleString(),
        data.fullName || "N/A",
        data.email || "N/A",
        data.subject || "N/A",
        data.message || "N/A"
      ]);
    } else {
      // QUIZ FORM LOGIC (Sheet 1)
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Full Name", "Email", "School/Organization", "Phone", "Goal", "Student Age", "Travel Timing"]);
        sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#3b3500").setFontColor("#ffffff");
      }
      sheet.appendRow([
        new Date().toLocaleString(),
        data.fullName || "N/A",
        data.email || "N/A",
        data.school || "N/A",
        data.phone || "N/A",
        data.goal || "N/A",
        data.age || "N/A",
        data.timing || "N/A"
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
