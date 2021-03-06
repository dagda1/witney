const shell = require("shelljs");
const { paths } = require("../../lib/node");
const pino = require("pino")({ prettyPrint: { forceColor: true } });
const yargs = require("yargs");

const coverage = function({ nameSpaceId }) {
  const argv = yargs.options({
    w: { alias: "watch", type: "boolean" },
    r: { alias: "reporter", type: "string", default: "html" }
  }).argv;
  const endOfOptions = argv._.join(" ");

  let reportDir = paths.project(`coverage/${nameSpaceId}`);

  shell.rm("-rf", reportDir);

  let command = `npx nyc report`;
  command += ` --reporter ${argv.reporter}`;
  command += ` --report-dir ${reportDir}`;
  command += ` --temp-dir ${paths.tmp(`.nyc_output_${nameSpaceId}`)}`;
  ["ts", "tsx", "js", "jsx"].forEach(
    extension => (command += ` --extension .${extension}`)
  );
  command += ` ${endOfOptions}`;

  pino.info(command);
  shell.exec(command);
};

module.exports = coverage;
