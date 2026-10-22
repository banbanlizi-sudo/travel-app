const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', '..', 'travel-app');
const DST = path.join(__dirname, '..', 'www');
let n = 0;
for (const f of ['index.html', 'manifest.json', 'icon.png', 'sw.js']) {
  const s = path.join(SRC, f);
  if (fs.existsSync(s)) { fs.copyFileSync(s, path.join(DST, f)); n++; }
}
console.log('已同步 ' + n + ' 个网页文件到 www/，接着执行: npx cap sync android');
