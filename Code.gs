
const SPREADSHEET_ID = '13pCWr4GvNgysOCddPLhkgsj6iVNwfbrE9JyAJIJPhgs';

const SHEET_NAMES = {
  REPRESENTATIVES: 'Representatives',
  STUDENTS: 'Students',
  PAYMENTS: 'Payments',
};

const HEADERS = {
  [SHEET_NAMES.REPRESENTATIVES]: ['cedula', 'fullName', 'phone', 'email', 'address', 'matricula'],
  [SHEET_NAMES.STUDENTS]: ['studentId', 'representativeCedula', 'name', 'level', 'grade', 'section'],
  [SHEET_NAMES.PAYMENTS]: ['paymentId', 'timestamp', 'registrationDate', 'paymentDate', 'representativeCedula', 'studentId', 'month', 'year', 'paymentMethod', 'reference', 'amount', 'status', 'observations', 'representativeName', 'matricula'],
};

// --- Standard Apps Script Functions ---

/**
 * Runs when the spreadsheet is opened. Adds a custom menu for administrative tasks.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Admin')
    .addItem('Initial Setup', 'initialSetup')
    .addToUi();
}

/**
 * Serves the main HTML page of the web application.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index.html')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Sistema de Gestión Escolar');
}

// --- Setup Function ---

/**
 * Creates sheets and headers if they don't exist. Safe to run multiple times.
 */
function initialSetup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ui = SpreadsheetApp.getUi();

  Object.keys(SHEET_NAMES).forEach(key => {
    const sheetName = SHEET_NAMES[key];
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`Sheet "${sheetName}" created.`);
    }

    const headers = HEADERS[sheetName];
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    
    // Check if headers are already set
    if (JSON.stringify(currentHeaders) !== JSON.stringify(headers)) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      Logger.log(`Headers set for sheet "${sheetName}".`);
    }
  });
  
  ui.alert('Setup Complete', 'All necessary sheets and headers are configured correctly.', ui.ButtonSet.OK);
}


// --- Data Helper Functions ---

/**
 * Converts a 2D array from a sheet into an array of objects.
 * @param {Array<Array<any>>} data The 2D array of data.
 * @param {Array<string>} headers The header row.
 * @returns {Array<Object>} An array of objects.
 */
function _convertSheetDataToObjects(data, headers) {
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

// --- Web App API Functions (called from frontend) ---

function getRepresentativeByCedula(cedula) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const repSheet = ss.getSheetByName(SHEET_NAMES.REPRESENTATIVES);
  const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);

  const repData = repSheet.getDataRange().getValues();
  const repHeaders = repData.shift();
  const representatives = _convertSheetDataToObjects(repData, repHeaders);

  const representative = representatives.find(r => String(r.cedula).trim() == cedula);

  if (!representative) {
    return null;
  }

  const stuData = stuSheet.getDataRange().getValues();
  const stuHeaders = stuData.shift();
  const allStudents = _convertSheetDataToObjects(stuData, stuHeaders);

  representative.students = allStudents.filter(s => String(s.representativeCedula).trim() == cedula);
  
  return representative;
}

function getPaymentsForStudent(studentId, month, year) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const allPayments = _convertSheetDataToObjects(data, headers);

    return allPayments.filter(p => 
        p.studentId == studentId && 
        p.month == month && 
        p.year == year && 
        p.status == 'approved'
    );
}

function getPaymentsByStatus(statuses) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const allPayments = _convertSheetDataToObjects(data, headers);
    
    return allPayments.filter(p => statuses.includes(p.status));
}

function updatePaymentStatus(paymentId, newStatus) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.PAYMENTS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColIndex = headers.indexOf('paymentId');
    const statusColIndex = headers.indexOf('status');

    if (idColIndex === -1 || statusColIndex === -1) {
        throw new Error("Column 'paymentId' or 'status' not found.");
    }

    for (let i = 1; i < data.length; i++) {
        if (data[i][idColIndex] == paymentId) {
            sheet.getRange(i + 1, statusColIndex + 1).setValue(newStatus);
            return true;
        }
    }
    return false;
}

function addPayment(paymentData) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.PAYMENTS);
    const newId = 'p' + (sheet.getLastRow() + 1); // Simple unique ID
    const timestamp = new Date().toISOString();
    const registrationDate = new Date().toISOString().split('T')[0];

    const newRow = [
      newId, timestamp, registrationDate, paymentData.paymentDate,
      paymentData.representativeCedula, paymentData.studentId,
      paymentData.month, paymentData.year, paymentData.paymentMethod,
      paymentData.reference || '', paymentData.amount, paymentData.status,
      paymentData.observations || '', paymentData.representativeName, paymentData.matricula
    ];
    
    sheet.appendRow(newRow);
    
    return { ...paymentData, id: newId, timestamp, registrationDate };
}

function addStudentAndRepresentative(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const repSheet = ss.getSheetByName(SHEET_NAMES.REPRESENTATIVES);
  const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);

  const repData = repSheet.getDataRange().getValues();
  const repHeaders = repData[0];
  const cedulaColIndex = repHeaders.indexOf('cedula');
  
  let representativeRow = -1;
  for (let i = 1; i < repData.length; i++) {
    if (String(repData[i][cedulaColIndex]).trim() == data.repCedula) {
      representativeRow = i + 1;
      break;
    }
  }

  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${String(currentYear + 1).slice(2)}`;
  
  let matricula;
  
  if (representativeRow > -1) { // Update existing representative
    const matriculaIndex = repHeaders.indexOf('matricula');
    matricula = repData[representativeRow-1][matriculaIndex];
    const updatedRepData = [data.repCedula, data.repName, data.phone, data.email, data.address, matricula];
    repSheet.getRange(representativeRow, 1, 1, repHeaders.length).setValues([updatedRepData]);
  } else { // Create new representative
    matricula = `mat-${schoolYear}-${data.repCedula}`;
    const newRepData = [data.repCedula, data.repName, data.phone, data.email, data.address, matricula];
    repSheet.appendRow(newRepData);
  }

  // Add new student
  const studentId = Utilities.getUuid();
  const newStudentData = [studentId, data.repCedula, data.studentName, data.level, data.grade, data.section];
  stuSheet.appendRow(newStudentData);

  // Return the full representative object
  return getRepresentativeByCedula(data.repCedula);
}

function getAllDataForReports() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const repSheet = ss.getSheetByName(SHEET_NAMES.REPRESENTATIVES);
    const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
    const paySheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);

    // Get Representatives
    const repData = repSheet.getDataRange().getValues();
    const repHeaders = repData.shift();
    const representatives = _convertSheetDataToObjects(repData, repHeaders);

    // Get Students
    const stuData = stuSheet.getDataRange().getValues();
    const stuHeaders = stuData.shift();
    const allStudents = _convertSheetDataToObjects(stuData, stuHeaders);

    // Get Payments
    const payData = paySheet.getDataRange().getValues();
    const payHeaders = payData.shift();
    const allPayments = _convertSheetDataToObjects(payData, payHeaders);
    
    // Attach students to representatives
    const repMap = {};
    representatives.forEach(r => {
        r.students = [];
        repMap[r.cedula] = r;
    });
    allStudents.forEach(s => {
        if (repMap[s.representativeCedula]) {
            repMap[s.representativeCedula].students.push(s);
        }
    });

    return {
        representatives: Object.values(repMap),
        payments: allPayments
    };
}
