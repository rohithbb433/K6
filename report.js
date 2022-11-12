const reporter = require("k6-html-reporter");

const options = {
  jsonFile: "./My_report.json",
  output: "Report.htlm",
};

reporter.generateSummaryReport(options);
