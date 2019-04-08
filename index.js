var fs = require("fs");

var formatData = require("./helpers").formatData;
var analyseData = require("./helpers").analyseData;
var storeData = require("./helpers").storeData;

let filename = process.argv[2];
let formattedData = null;
let resutData = null;

fs.readFile(filename, "utf8", async (err, data) => {
  if (err) throw err;
  formattedData = formatData(data);

  try {
    await analyseData(formattedData);
  } catch (err) {
    console.log(err);
  }
});
