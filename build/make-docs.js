const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');
const {join} = require('path');
const pathTo = {
  jsdocConfig: join(__dirname, 'jsdoc.json'),
  inputFiles: join(__dirname, '..', 'src', 'index.js')
};

jsdoc2md.getTemplateData({
  configure: pathTo.jsdocConfig,
  files: pathTo.inputFiles
}).then(
  (data) => jsdoc2md.render({data}).then(
    (result) => {
      fs.writeFileSync('API.md', result);
      console.log(result);
      return 0;
    }
  )
);
