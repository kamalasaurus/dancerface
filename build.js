const path = require('path');
const fs = require('fs');

module.exports = {
  copy: function(filepath) {
    const filename = filepath.split(path.sep).slice(-1).join();
    fs.copyFileSync(filepath, path.join('.', 'app', 'scripts', filename));
    return filename;
  },
  concat: function(target, filename) {
    const filepath = path.join('.', 'scripts', filename);
    return target.concat(`\n    <script src="${filepath}" type="application/javascript"></script>`);
  },
  compile: function(scriptString) {
    const html = fs
      .readFileSync(path.join('.', 'index-template.html'), 'utf8')
      .replace('<body>', `<body>${scriptString}`);

    fs.writeFileSync(path.join('.', 'app', 'index.html'), html);
    return;
  }
};

