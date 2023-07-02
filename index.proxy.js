const proxyList = require('./sqlite/proxyList');
const proxyCache = require('./sqlite/proxyCache');
const utils = require('./utils');

function parseJson(data) {
  if (!data) return null;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('json parse error', typeof data, data);
    return null;
  }
}

function getPostData(req) {
  return new Promise(resolve => {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(decodeURIComponent(chunk));
    });
    req.on('end', async () => {
      const postData = parseJson(chunks.join(','));
      resolve(postData);
    });
    req.on('error', () => {
      resolve(undefined);
    })
  })
}

async function proxyApi(url, req, res) {
  if (url === '/proxy/list') {
    const result = await proxyList.list();
    utils.responseEnd(res, utils.jsonResult(result), utils.contentTypes.json);
  } else if (url === '/proxy/add') {
    getPostData(req).then(async params => {
      let boo;
      if (params.id) {
        boo = await proxyList.update(params.id, params.name, params.url);
      } else {
        boo = await proxyList.add(params.name, params.url);
      }
      utils.responseEnd(res, utils.jsonResult('', boo ? 0 : 1), utils.contentTypes.json);
    });
  } else if (url === '/proxy/delete') {
    getPostData(req).then(async params => {
      const boo = await proxyList.remove(params.id);
      utils.responseEnd(res, utils.jsonResult(boo ? '' : '删除失败', boo ? 0 : 1), utils.contentTypes.json);
    })
  } else if (url === '/proxy/clean') {
    getPostData(req).then(async params => {
      const boo = await proxyCache.removeAll(params.id);
      utils.responseEnd(res, utils.jsonResult(boo ? '' : '清空失败', boo ? 0 : 1), utils.contentTypes.json);
    })
  } else if (url === '/proxy/use') {
    getPostData(req).then(async params => {
      const boo = await proxyList.use(params.id, params.status);
      utils.responseEnd(res, utils.jsonResult(boo ? '' : '操作失败', boo ? 0 : 1), utils.contentTypes.json);
    })
  } else if (url === '/proxy/cache/list') {
    getPostData(req).then(async params => {
      const result = await proxyCache.list(params.pid);
      utils.responseEnd(res, utils.jsonResult(result), utils.contentTypes.json);
    })
  } else if (url === '/proxy/cache/delete') {
    getPostData(req).then(async params => {
      const result = await proxyCache.remove(params.id);
      utils.responseEnd(res, utils.jsonResult(result), utils.contentTypes.json);
    })
  }
}

module.exports = proxyApi;
