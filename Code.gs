/**
 * Google Apps Script for "The Hospitality OS" Waitlist
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this entire payload.
 * 4. Hit Save.
 * 5. Run the "setup" function once manually to grant permissions (Click Run, review permissions, advanced, allow).
 * 6. Click Deploy > New deployment.
 * 7. Choose "Web app".
 * 8. Set Execute as: "Me" and Who has access: "Anyone".
 * 9. Click Deploy, authorize if prompted again, and copy the Web App URL.
 * 10. Paste the Web App URL into the `SCRIPT_URL` variable in your `index.html` file.
 */

// Basic setup to ensure we have headers in the sheet (optional, run once manually)
function setup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "First Name", "Email"]);
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }
}

// Function to handle the POST request coming from our HTML fetch
function doPost(e) {
  try {
    // 1. Get the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Extract timestamp and form parameters
    const timestamp = new Date();
    // e.parameter contains the URL-encoded data sent via fetch
    const firstName = e.parameter.firstName;
    const email = e.parameter.email;
    
    // Validate we got the required fields
    if (!firstName || !email) {
      throw new Error("Missing first name or email in the request.");
    }

    // 3. Append data to the Google Sheet
    sheet.appendRow([timestamp, firstName, email]);
    
    // 4. Send confirmation email to the subscriber
    const userSubject = "You're on the list — The Hospitality OS";
    const userBody = "Hey " + firstName + ",\n\n" + 
                     "You're officially on the waitlist. I only work with 5 coaches at a time and I take that seriously. " +
                     "When a spot opens you'll be the first to know.\n\n" +
                     "In the meantime, follow along on Instagram and Threads where I share daily content on hospitality, " + 
                     "automation and what it actually looks like to build a business from Da Nang, Vietnam.\n\n" +
                     "Talk soon.";
    
    MailApp.sendEmail(email, userSubject, userBody);
    
    // 5. Send notification email to the owner
    const ownerEmail = "owner@gmail.com"; // <-- Update this if you want it sent to a different address
    const ownerSubject = "New waitlist signup: " + firstName;
    const ownerBody = "You have a new waitlist signup:\n\n" +
                      "Name: " + firstName + "\n" +
                      "Email: " + email + "\n" +
                      "Timestamp: " + timestamp;
    
    MailApp.sendEmail(ownerEmail, ownerSubject, ownerBody);
    
    // 6. Return a JSON success response
    // Apps Script requires this specific TextOutput format to return JSON properly
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Successfully added to waitlist."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    // 7. Return a JSON error response if something fails
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error", 
      "error": error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Keep a GET endpoint just in case someone tries to access the URL directly in browser
function doGet(e) {
  return ContentService.createTextOutput("The Hospitality OS Waitlist Endpoint is active.");
}
