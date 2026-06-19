const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ts = require("typescript");

const loadFrontendData = () => {
  const dataPath = path.resolve(__dirname, "../../angiagreen/lib/data.ts");
  const source = fs.readFileSync(dataPath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require(request) {
      if (request === "./types") {
        return {};
      }

      return require(request);
    },
  };

  vm.runInNewContext(output, sandbox, { filename: dataPath });
  return module.exports;
};

module.exports = loadFrontendData;
