var fs = require("fs");
const https = require("https");

var wstream = fs.createWriteStream("result.txt");
var fields;
var isHeader = false;
var i = 0;

batchPromise = (batchSize, thenArr, fn) => {
  return Promise.resolve(thenArr).then(function(arr) {
    return arr
      .map(function(_, i) {
        return i % batchSize ? [] : arr.slice(i, i + batchSize);
      })
      .map(function(group) {
        return function(res) {
          return Promise.all(group.map(fn)).then(function(r) {
            return res.concat(r);
          });
        };
      })
      .reduce(function(chain, work) {
        return chain.then(work);
      }, Promise.resolve([]));
  });
};
storeData = data => {
  if (!isHeader)
    fields = Object.keys(data.annotation_summary.transcriptConsequenceSummary);
  var replacer = function(key, value) {
    return value === undefined ? "xxxxxx" : value;
  };
  let csv = fields.map(fieldName => {
    return JSON.stringify(
      data.annotation_summary.transcriptConsequenceSummary[fieldName],
      replacer
    );
  });

  if (!isHeader) {
    wstream.write(fields.join(" "));
    isHeader = true;
  }
  csv = csv.join(" ");
  wstream.write("\n");
  wstream.write(csv);
};

module.exports = {
  formatData: data => {
    var cells = data.split("\n").map(function(el) {
      return el.split("\t");
    });

    var headings = cells.shift();
    var obj = cells.map(function(el) {
      var obj = {};
      for (var i = 0, l = el.length; i < l; i++) {
        obj[headings[i]] = isNaN(Number(el[i])) ? el[i] : +el[i];
      }
      return obj;
    });
    return obj;
  },
  analyseData: async data => {
    let promiseArray = [];
    urls = data.map(d => {
      return `https://genomenexus.org/annotation/genomic/${d.Chromosome},${
        d.Start_Position
      },${d.End_Position},${d.Reference_Allele},${
        d.Tumor_Seq_Allele1
      }?isoformOverrideSource=uniprot&fields=annotation_summary`;
    });

    batchPromise(
      500,
      urls,
      url =>
        new Promise((resolve, reject) => {
          https.get(url, (response, err) => {
            if (err) reject(err);
            let bodyChunks = [];
            response
              .on("data", chunks => {
                i++;
                bodyChunks.push(chunks);
              })
              .on("end", () => {
                var body = Buffer.concat(bodyChunks);
                console.log(i);
                resolve(body);
              });
          });
        })
    ).then(results => {
      results.map(result => storeData(JSON.parse(result)));
    });
  }
};
