const fs = require('fs');
const sqlite3 = require('sqlite3');
const config = require('./config');

/** 初始化数据库 */
function init() {
  /** https://www.sqlite.org/index.html */
  const db = new sqlite3.Database(config.db);
  // 设置超时等待，防止多个数据操作同时进行导致报错
  db.configure('busyTimeout', 30000);
  db.exec('pragma busy_timeout=30000', execErr => {
    if (execErr) {
      console.log('execErr', execErr);
    }
  });
  
  fs.readFile(config.initDbPath, 'utf-8', (err, sqlText) => {
    if (err) {
      console.log(`检查数据库-文件读取错误：${config.initDbPath}`);
      throw err;
    }
    db.serialize(() => {
      db.exec(sqlText, errDb => {
        if (errDb) {
          console.log('errDb', errDb);
        }
        fs.readFile(config.initDataPath, 'utf8', (err, data) => {
          if (err) {
            console.log(`检查数据库-文件读取错误：${config.initDataPath}`);
            throw err;
          }
          db.exec(data, errData => {
            if (errData) {
              console.log('errData', errData);
            }
            db.close(() => {
              console.log(`数据库 ${config.db} 初始完毕。`);
            });
          });
        });
      });
    });
  });
}

module.exports = {
  init,
};
