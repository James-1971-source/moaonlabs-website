const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.join(__dirname, '..', 'public', 'sites', 'moaon');
sharp(path.join(root, 'hero-sculpture.svg'), { density: 180 })
  .resize({ width: 1440 })
  .webp({ quality: 92, effort: 6 })
  .toFile(path.join(root, 'hero-sculpture.webp'))
  .then(info => { console.log(info); console.log('original editable SVG retained'); })
  .catch(error => { console.error(error); process.exit(1); });
