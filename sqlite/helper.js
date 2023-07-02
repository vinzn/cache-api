const config = require('./config');
const sqlite3 = require('sqlite3');

const sqliteBase = {
  connectionString: config.db,
  lastID: 0,
  /**
   * 添加数据
   * @param {string} tableName 表名
   * @param {object} model 实体数据
   * @param {boolean} notAutoinc 是否非自增长主键
   */
  add(tableName, model, notAutoinc) {
    const params = {};
    let sql = 'INSERT INTO ' + tableName + '(';
    let num = 1;
    for (const col in model) {
      sql += (num === 1 ? '' : ',') + col;
      params[num] = model[col];
      num++;
    }
    sql += ') VALUES(';
    for (let i = 1; i < num; i++) {
      sql += (i === 1 ? '' : ',') + '?' + i;
    }
    sql += ')';
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.run(sql, params, err => {
        if (err) {
          console.log('add-' + tableName + ':' + sql, err);
          db.close();
          resolve(false);
          return;
        }
        // 下一次查询之前必须关闭，否则报错
        db.close();
        if (notAutoinc !== true) {
          model.id = this.lastID ? this.lastID : 0;
        }
        resolve(true);
        // db = new sqlite3.Database(config.db);
        // db.configure('busyTimeout', 30000);
        // db.get('SELECT last_insert_rowid() AS rowid', (err, row) => {
        //   // console.log('last_insert_rowid', row);
        //   if (err) {
        //     console.log('add-' + tableName, err);
        //   }
        //   if (row) {
        //     model.id = row.rowid;
        //   }
        //   console.log('row', row);
        //   db.close();
        //   resolve(true);
        // });
      });
    });
  },
  /**
   * 批量添加数据
   * @param {string} tableName 表名
   * @param {object[]} models 实体数据
   * @return {boolean} 是否成功
   */
  adds(tableName, models) {
    const params = {};
    let sql = '';
    let num = 1;
    for (const index in models) {
      const model = models[index];
      let forSql = 'INSERT INTO ' + tableName + '(';
      const forNum = num;
      for (const col in model) {
        forSql += (forSql ? ',' : '') + col;
        params[num] = model[col];
        num++;
      }
      forSql += ') VALUES(';
      for (let i = forNum; i < num; i++) {
        forSql += (i === forNum ? '' : ',') + '?' + i;
      }
      forSql += ');';
      sql += forSql;
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.all(sql, params, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('adds-' + tableName + ':' + sql, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  /**
   * 批量不安全添加数据
   * @param {string} tableName 表名
   * @param {object[]} models 实体数据
   * @return {boolean} 是否成功
   */
  addsUnSafe(tableName, models) {
    let sql = '';
    for (const index in models) {
      const model = models[index];
      let forSql = 'INSERT INTO ' + tableName + '(';
      let valueSql = '';
      let num = 1;
      for (const col in model) {
        forSql += (num === 1 ? '' : ',') + col;
        valueSql += (num === 1 ? '' : ',') + model[col];
        num++;
      }
      forSql += ') VALUES(' + valueSql + ');';
      sql += forSql;
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.exec(sql, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('addsUnSafe-' + tableName + ':' + sql, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  /**
   * 取得总数
   * @param {string} tableName 表名
   * @param {object} whereColumns 查询条件
   */
  count(tableName, whereColumns) {
    const params = {};
    let sql = 'SELECT COUNT(1) AS count FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        if (Array.isArray(whereColumns[col])) {
          // 数组
          whereSql += (num === 1 ? '' : ' AND ') + col + ' IN (';
          for (const index in whereColumns[col]) {
            whereSql += (index === '0' ? '' : ',') + '?' + num;
            params[num] = whereColumns[col][index];
            num++;
          }
          whereSql += ')';
          continue;
        }
        whereSql += (num === 1 ? '' : ' AND ') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.get(sql, params, (err, row) => {
        if (err) {
          console.log('max-' + tableName + ':' + sql, err);
        }
        db.close();
        resolve(row ? row.count : 0);
      });
    });
  },
  /**
   * 删除数据
   * @param {string} tableName 表名
   * @param {object} whereColumns 删除条件
   */
  delete(tableName, whereColumns) {
    const params = {};
    let sql = 'DELETE FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        whereSql += col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.run(sql, params, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('delete-' + tableName, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  /**
   * 根据条件查询单条数据
   * @param {string} tableName 表名
   * @param {object} whereColumns 查询条件
   * @return {object} 查询结果
   */
  get(tableName, whereColumns) {
    const params = {};
    let sql = 'SELECT * FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        whereSql += (num === 1 ? '' : ' AND ') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    sql += ' LIMIT 1';
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      // db.serialize(() => {
      db.get(sql, params, (err, row) => {
        if (err) {
          console.log('get-' + tableName, err);
        }
        db.close();
        resolve(row);
      });
      // });
    });
  },
  /**
   * 根据条件查询数据
   * @param {string} tableName 表名
   * @param {object} whereColumns 查询条件
   * @return {object} 查询结果
   */
  gets(tableName, whereColumns) {
    const params = {};
    let sql = 'SELECT * FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        if (Array.isArray(whereColumns[col])) {
          // 数组
          whereSql += (num === 1 ? '' : ' AND ') + col + ' IN (';
          for (const index in whereColumns[col]) {
            whereSql += (index === '0' ? '' : ',') + '?' + num;
            params[num] = whereColumns[col][index];
            num++;
          }
          whereSql += ')';
          continue;
        }
        whereSql += (num === 1 ? '' : ' AND ') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      // db.serialize(() => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('gets-' + tableName, err);
        }
        db.close();
        resolve(rows);
      });
      // });
    });
  },
  /**
   * 根据条件查询数据
   * @param {string} tableName 表名
   * @return {object} 查询结果
   */
  getsForProxy(tableName) {
    const params = {};
    let sql = `SELECT *, (SELECT COUNT(1) FROM proxy_cache WHERE pid=t.id) num FROM ${tableName} t WHERE is_deleted=0`;
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('gets-' + tableName, err);
        }
        db.close();
        resolve(rows);
      });
    });
  },
  /**
   * 根据条件查询数据
   * @param {string} tableName 表名
   * @param {string} colName 列名
   * @param {object} values 数组集
   * @return {object} 查询结果
   */
  getsByCol(tableName, colName, values) {
    const params = {};
    let sql = 'SELECT * FROM ' + tableName + ' WHERE ' + colName + ' IN (';
    let num = 1;
    for (const col in values) {
      sql += (num === 1 ? '' : ',') + '?' + num;
      params[num] = values[col];
      num++;
    }
    sql += ')';
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      // db.serialize(() => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('getsByCol-' + tableName, err);
        }
        db.close();
        resolve(rows);
      });
      // });
    });
  },
  int(sql) {
    return sql;
  },
  /**
   * 取得指定字段最大值的数据
   * @param {string} tableName 表名
   * @param {sring} columnName 字段名
   * @param {object} whereColumns 查询条件
   */
  max(tableName, columnName, whereColumns) {
    const params = {};
    let sql = 'SELECT MAX(' + columnName + ') AS ' + columnName + ' FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        whereSql += (num === 1 ? '' : ' AND ') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.get(sql, params, (err, row) => {
        if (err) {
          console.log('max-' + tableName + ':' + sql, err);
        }
        db.close();
        resolve(row);
      });
    });
  },
  nonQuery(sql, parameters, isTransaction, timeout, defaultValue) {
    return sql + parameters + isTransaction + timeout + defaultValue;
  },
  /**
   * 分页查询
   * @param {object} page 分页数据
   * @param {number} page.pageIndex 分页数据-第几页
   * @param {number} page.pageSize 分页数据-多少行
   * @param {string} tableName 表名
   * @param {object} whereColumns 查询条件：字段对应值
   */
  page(page, tableName, whereColumns) {
    const params = {};
    let sql = 'SELECT * FROM ' + tableName;
    if (whereColumns) {
      let whereSql = '';
      let num = 1;
      for (const col in whereColumns) {
        if (Array.isArray(whereColumns[col])) {
          // 数组
          whereSql += (num === 1 ? '' : ' AND ') + col + ' IN (';
          for (const index in whereColumns[col]) {
            whereSql += (index === '0' ? '' : ',') + '?' + num;
            params[num] = whereColumns[col][index];
            num++;
          }
          whereSql += ')';
          continue;
        }
        whereSql += (num === 1 ? '' : ' AND ') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    const offset = (page.pageIndex - 1) * page.pageSize;
    sql += ' LIMIT ' + page.pageSize + ' OFFSET ' + offset;
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('page-' + tableName + ':' + sql, err);
        }
        db.close();
        resolve(rows);
      });
    });
  },
  string(sql) {
    return sql;
  },
  /**
   * 更新数据
   * @param {string} tableName 表名
   * @param {object} updateColumns 更新字段
   * @param {object} whereColumns 更新条件
   */
  update(tableName, updateColumns, whereColumns) {
    const params = {};
    let sql = 'UPDATE ' + tableName + ' SET ';
    let num = 1;
    for (const col in updateColumns) {
      sql += (num === 1 ? '' : ',') + col + '=?' + num;
      params[num] = updateColumns[col];
      num++;
    }
    if (whereColumns) {
      let whereSql = '';
      for (const col in whereColumns) {
        whereSql += (whereSql ? ' AND ' : '') + col + '=?' + num;
        params[num] = whereColumns[col];
        num++;
      }
      if (whereSql) {
        sql += ' WHERE ' + whereSql;
      }
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.run(sql, params, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('update-' + tableName, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  /**
   * 根据id更新数据
   * @param {string} tableName 表名
   * @param {object} model 实体
   */
  updateById(tableName, model) {
    const params = {};
    let num = 1;
    let sql = 'UPDATE ' + tableName + ' SET ';
    for (const col in model) {
      if (col === 'id') {
        continue;
      }
      sql += (num === 1 ? '' : ',') + col + '=?' + num;
      params[num] = model[col];
      num++;
    }
    sql += ' WHERE id=' + model.id + ';';
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.run(sql, params, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('updateById-' + tableName + ':' + sql, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  /**
   * 根据id批量更新
   * @param {string} tableName 表名
   * @param {object[]} models 数据列表
   */
  updatesById(tableName, models) {
    const params = {};
    let sql = '';
    let num = 1;
    for (const index in models) {
      const model = models[index];
      let forSql = 'UPDATE ' + tableName + ' SET ';
      const forNum = num;
      for (const col in model) {
        if (col === 'id') {
          continue;
        }
        forSql += (forNum === num ? '' : ',') + col + '=?' + num;
        params[num] = model[col];
        num++;
      }
      forSql += ' WHERE id=' + model.id + ';';
      sql += forSql;
    }
    return new Promise(resolve => {
      const db = new sqlite3.Database(config.db);
      db.configure('busyTimeout', 30000);
      db.all(sql, params, err => {
        let result = true;
        if (err) {
          result = false;
          console.log('updatesById-' + tableName + ':' + sql, err);
          db.close();
          resolve(result);
          return;
        }
        db.close();
        resolve(true);
      });
    });
  },
  updateAll(updateColumns) {
    return updateColumns;
  },
};

module.exports = sqliteBase;
