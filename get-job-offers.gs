function onOpen() {
  // Add a myFunction to menu bar

  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {
      name : "Get jobs from indeed",
      functionName : "myFunction"
    }
  ];
  sheet.addMenu("Run script", entries);
};


const replaceJobsCount = (str) => {
  // replace unnecessary letters

  str = str.replace('&nbsp;(', '')
  str = str.replace(')', '')
  return str
};

  
const getDate = () =>{
  // get a today's date

  const today = new Date(); 
  return String(Utilities.formatDate(today, "JST", "YYYY/MM/dd"));
};


const createCopy = (sheet, sheetData) => {
  // create a copy of origin sheet

  let today = getDate();
  sheet.insertSheet(today, 0, {template: sheetData});
  sheet.moveActiveSheet(sheet.getNumSheets());
};


function getIndeedJobs(sheetData){
  // get counts of jobs from indeed.ca

  const colID = 3;
  const rowStartData = 8;
  const rowEndData = sheetData.getDataRange().getLastRow();
  
  for (let i = rowStartData; i <= rowEndData; i ++) {

    const keyword = sheetData.getRange(i, colID).getValue();
    const getUrl = `https://ca.indeed.com/jobs?q=${keyword}&l=Vancouver%2C+BC`;
    
    let fullTimeJobs = 0;
    let permanentJobs = 0;
    let contractJobs = 0;
    let internshipJobs = 0;
    let partTimeJobs = 0;
    let temporaryJobs = 0;
    
    let html = UrlFetchApp.fetch(getUrl).getContentText('UTF-8');   
    const data_list = Parser.data(html).from('<span class="rbLabel">').to('</span>').iterate();
    
    for (let j = 0; j < data_list.length; j++) {

      switch (data_list[j]) {
        case "Full-time":
          fullTimeJobs = replaceJobsCount(data_list[j+1]);
          break;
        case "Permanent":
          permanentJobs = replaceJobsCount(data_list[j+1]);
          break;
        case "Contract":
          contractJobs = replaceJobsCount(data_list[j+1]);
          break;
        case "Internship":
          internshipJobs = replaceJobsCount(data_list[j+1]);
          break;
        case "Part-time":
          partTimeJobs = replaceJobsCount(data_list[j+1]);
          break;
        case "Temporary":
          temporaryJobs = replaceJobsCount(data_list[j+1]);
          break;
      }
    }
 
    const arr = [fullTimeJobs, permanentJobs, contractJobs, partTimeJobs, temporaryJobs, internshipJobs]

    const minJobTypecolID = 4;
    const maxJobTypecolID = 9;

    for (let k = minJobTypecolID; k <= maxJobTypecolID; k++) {
      sheetData.getRange(i, k).setValue(arr[k-minJobTypecolID]);
    }
  }
};

function myFunction () {
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetData = sheet.getSheetByName("Demand");
  
  // create a copy of original sheet
  createCopy(sheet, sheetData);

  // overwrite a date
  sheetData.getRange(1, 2).setValue(getDate());

  // get indeed data
  getIndeedJobs(sheetData);

  Browser.msgBox("Dane!");
};