#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { paths } = require("../lib/node");

const nodeModulesPath = paths.project("node_modules");
const licenses = fs
  .readdirSync(nodeModulesPath)
  .map(moduleName => {
    const modulePkg = path.join(nodeModulesPath, moduleName, "package.json");
    if (!fs.existsSync(modulePkg)) {
      return;
    }

    const pkg = require(modulePkg);
    if (!pkg.license) {
      return;
    }

    return { moduleName, license: pkg.license };
  })
  .reduce((licenses, module) => {
    if (!module) return licenses;

    let { moduleName, license } = module;

    if (Array.isArray(license)) {
      license = license.join(", ");
    }

    if (typeof license === "object") {
      if (license.type) {
        license = license.type;
      } else {
        license = JSON.stringify(license);
      }
    }

    licenses[license] = licenses[license] || [];
    licenses[license].push(moduleName);

    return licenses;
  }, {});

console.log(licenses);
