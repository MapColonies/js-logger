const fs = require('fs').promises;
const glob = require('glob');

module.exports = async () => {
  glob.Glob('*.log', {}, async (err, files) => {
    await Promise.all(files.map((file) => fs.unlink(file)));
  });
};
