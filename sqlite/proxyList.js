const helper = require('./helper');
const nanoid = require('../nanoid');

const tableName = 'proxy_list';

async function add(name, url) {
  if (!name || !url || !name.trim() || !url.trim()) return false;
  const obj = {
    id: nanoid(),
    name: name,
    url: url,
  };
  try {
    const boo = await helper.add(tableName, obj);
    return boo;
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function getActive() {
  try {
    const one = await helper.get(tableName, { is_deleted: 0, status: 1 });
    return one;
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

async function update(id, name, url) {
  if (!id || !name || !url || !name.trim() || !url.trim()) return false;
  try {
    const boo = await helper.update(tableName, { name, url }, { id });
    return boo;
  } catch (error) {
    console.log(error);    
  }
  return false;
}

async function use(id, status) {
  if (!id) return false;
  if (status === 1) {
    try {
      const boo = await helper.update(tableName, { status }, { id });
      if (!boo) return false;
    } catch (error) {
      console.log(error)
    }
  }
  try {
    const boo = helper.update(tableName, { status });
    return boo;
  } catch (error) {
    console.log(error);    
  }
  return true;
}

async function list() {
  try {
    const tempList = await helper.getsForProxy(tableName);
    return tempList.map(x => ({
      id: x.id,
      name: x.name,
      url: x.url,
      status: x.status,
      num: x.num || 0,
      error: 0,
    }))
  } catch (error) {
    console.log(error)
  }
  return [];
}

async function remove(id) {
  if (!id) return false;
  try {
    const boo = await helper.delete(tableName, { id });
    return boo;
  } catch (error) {
    console.log(error);
  }
  return false;
}

module.exports = {
  add,
  remove,
  getActive,
  list,
  update,
  use,
}