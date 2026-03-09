const fs = require('fs');
const path = require('path');

const srcBread1 = 'c:\\Users\\saefs\\.gemini\\antigravity\\brain\\6452744f-2fc1-4780-9034-344a2c11c1d9\\media__1773053875569.jpg';
const destBread1 = 'c:\\Users\\saefs\\OneDrive\\Рабочий стол\\smuslest\\public\\photo\\bread1.jpg';

const srcSnack1 = 'c:\\Users\\saefs\\.gemini\\antigravity\\brain\\6452744f-2fc1-4780-9034-344a2c11c1d9\\media__1773053919102.jpg';
const destSnack1 = 'c:\\Users\\saefs\\OneDrive\\Рабочий стол\\smuslest\\public\\photo\\snack1.jpg';

fs.copyFileSync(srcBread1, destBread1);
fs.copyFileSync(srcSnack1, destSnack1);
console.log('Files copied manually.');
