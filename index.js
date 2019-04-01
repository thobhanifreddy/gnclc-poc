var fs = require("fs");
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  console.log('PerformanceObserver A to B',items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

var formatData = require("./helpers").formatData;
var analyseData = require("./helpers").analyseData;
var storeData = require("./helpers").storeData;

let filename = process.argv[2];
let formattedData = null;
let resutData = null;

performance.mark('A');
fs.readFile(filename, "utf8", async (err, data) => {
  if (err) throw err;
  formattedData = formatData(data);
  resutData = await analyseData(formattedData);
  storeData(resutData);
  performance.mark('B');
  performance.measure('A to B', 'A', 'B');
});
