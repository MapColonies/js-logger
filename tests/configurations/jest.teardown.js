const fs = require('fs').promises;
const glob = require('glob');

module.exports = async () => {
  const files = await glob.glob('*.log');
  await Promise.all(files.map((file) => fs.unlink(file)));
};
