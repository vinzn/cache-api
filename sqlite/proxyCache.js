const helper = require('./helper');
const nanoid = require('../nanoid');

const tableName = 'proxy_cache';

async function add(pid, url, requestHeader, requestData, responseHeader, responseData, status) {
  if (!pid || !url || !pid.trim() || !url.trim()) return false;
  const obj = {
    id: nanoid(),
    pid,
    url,
    requestHeader,
    requestData,
    responseHeader,
    responseData,
    status,
  };
  try {
    const one = await helper.get(tableName, { pid, url, requestHeader, requestData });
    if (one) return false;
    const boo = await helper.add(tableName, obj);
    console.log('add', boo);
    return boo;
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function get(pid, url, requestHeader, requestData) {
  try {
    const one = await helper.get(tableName, { pid, url, requestHeader, requestData });
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

async function list(pid) {
  try {
    const tempList = await helper.gets(tableName, { pid });
    return tempList || [];
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

async function removeAll(pid) {
  if (!pid) return false;
  try {
    const boo = await helper.delete(tableName, { pid });
    return boo;
  } catch (error) {
    console.log(error);
  }
  return false;
}


module.exports = {
  add,
  get,
  update,
  list,
  remove,
  removeAll,
}