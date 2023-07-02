const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const Duplex = require('stream').Duplex;
const sqlite = require('./sqlite');
const proxyList = require('./sqlite/proxyList');
const proxyCache = require('./sqlite/proxyCache');
const utils = require('./utils');
const proxyApi = require('./index.proxy')

sqlite.init();

// 代理地址
// const proxyUrl = 'https://ai.codecenter.cn';
const proxyPrefix = '/api/'

// 服务端口
const serverPort = 8003;

let imgData = [];
let txtData = [];


const proxy = httpProxy.createProxyServer({
  changeOrigin: true
});
const server = http.createServer(async function(req, res) {
  const urlArr = req.url.split('?');
  const url = urlArr[0];
  if (url === '/abort') {
    throw new Error('abort');
  }
  if (url === '/favicon.ico') {
    res.write('');
    res.end();
    return;
  }
  if (url.indexOf('/proxy/') === 0) {
    await proxyApi(url, req, res);
    return;
  }
  if (url.indexOf(proxyPrefix) === 0) {
    // const token = localStorage.getItem('token');
    // req.headers.token = token;
    const activeProxy = await proxyList.getActive();
    if (!activeProxy) {
      utils.responseEnd(res, utils.jsonResult('未启用代理', 1), utils.contentTypes.json);
      return;
    }
    if (!activeProxy.url || !/http[s]?:\/\/.+/.test(activeProxy.url.toLocaleLowerCase())) {
      utils.responseEnd(res, utils.jsonResult(`代理地址错误: ${activeProxy.url}`, 1), utils.contentTypes.json);
      return;
    }
    const callback = (err, errReq, errRes, errUrl) => {
      if (imgData.length > 0) {
        errRes.write(imgData.join(''), 'binary');
      }
      errRes.end();
    }
    req.pid = activeProxy.id;
    if (req.method && req.method.toLocaleLowerCase() !== 'get') {
      const bufs = []
      req.on('data', d => {
        bufs.push(d);
      });
      req.on('end', async () => {
        const buf = Buffer.concat(bufs);
        const stream = new Duplex();
        stream.push(buf);
        stream.push(null);
        req.data = buf.toString();
        const one = await proxyCache.get(activeProxy.id, req.url, JSON.stringify(req.headers), req.data);
        if (one) {
          utils.responseEnd(res, one.responseData, utils.contentTypes.html);
          return;
        }
        proxy.web(req, res, { target: activeProxy.url, buffer: stream, selfHandleResponse: true }, callback);
      })
      return;
    }

    const one = await proxyCache.get(activeProxy.id, req.url, JSON.stringify(req.headers), '');
    if (one) {
      utils.responseEnd(res, one.responseData, utils.contentTypes.html);
      return;
    }
    proxy.web(req, res, { target: activeProxy.url, selfHandleResponse: true }, callback);
    return;
  }
  // 其他请求
  const html = fs.readFileSync('index.html', { encoding: 'utf-8' });
  utils.responseEnd(res, html, utils.contentTypes.html);
});
proxy.on('error', function(err, req, res) {
  console.log('proxy.error', err);
  utils.responseEnd(res, JSON.stringify({ code: -1, data: 'proxy error', error: err }));
});
// proxy.on('end', function(req, res, proxyRes) {
//   // console.log('end');
//   // console.log('header', JSON.stringify(req.rawHeaders));
//   // console.log(JSON.stringify(proxyRes.headers));
// });
proxy.on('proxyRes', function(proxyRes, req, res) {
  imgData = [];
  txtData = [];
  const ct = proxyRes.headers['content-type'] || proxyRes.headers.contentType || '';
  if (ct.indexOf('image') !== 0) {
    // proxyRes.pipe(res);
    proxyRes.on('data', chunk => {
      txtData.push(chunk);
    });
    proxyRes.on('end', () => {
      const url = req.url || '';
      let requestData = req.data || '';
      const requestHeader = JSON.stringify(req.headers);
      const responseData = txtData.join('');
      const responseHeader = JSON.stringify(proxyRes.headers);
      proxyCache.add(req.pid, url, requestHeader, requestData, responseHeader, responseData, 0);
      utils.responseEnd(res, responseData, utils.contentTypes.json);
    });
    return;
  }
  proxyRes.setEncoding('binary');
  proxyRes.on('data', chunk => {
    imgData.push(chunk);
  });
  proxyRes.on('end', () => {
    res.write(imgData.join(''), 'binary');
    res.end();
  });
  // proxyRes.on('error', () => {
  //   console.log('proxyRes error');
  // });
});
server.listen(serverPort);
console.log(`启动成功: http://localhost:${serverPort}`);
