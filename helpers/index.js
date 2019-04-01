var fs = require("fs");
const https = require("https");

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
    data.forEach(d => {
      let url = `https://genomenexus.org/annotation/genomic/${d.Chromosome},${
        d.Start_Position
      },${d.End_Position},${d.Reference_Allele},${
        d.Tumor_Seq_Allele1
      }?isoformOverrideSource=uniprot&fields=annotation_summary`;
      promiseArray.push(
        new Promise((resolve, reject) => {
          https.get(url, (response, err) => {
            if (err) reject(err);
            let bodyChunks = [];
            response
              .on("data", chunks => {
                bodyChunks.push(chunks);
              })
              .on("end", () => {
                var body = Buffer.concat(bodyChunks);
                resolve(body);
              });
          });
        })
      );
    });
    let result = await Promise.all(promiseArray);
    result = result.map(r => JSON.parse(r))
    return result;
  },
  storeData: data => {
    var fields = Object.keys(data[0].annotation_summary.transcriptConsequenceSummary);
    fields = fields.filter((f, i) => i < 6);
    var replacer = function(key, value) {
      return value === undefined ? "xxxxxx" : value;
    };
    let csv = data.map(row =>
      fields
        .map(fieldName => {
          return JSON.stringify(row.annotation_summary.transcriptConsequenceSummary[fieldName], replacer);
        })
        .join(" ")
    );
    csv.unshift(fields.join(" ")); // add header column
    fs.writeFile("./result.txt", csv.join("\r\n"), function(err) {
      if (err) {
        return console.log(err);
      }
    });
  }
};
