const contentTypes = {
  html: 'text/html;charset=utf-8',
  json: 'application/json;charset=utf-8',
  text: 'text/plain;charset=utf-8',
};

function jsonResult(data, code) {
  return JSON.stringify({ code: code || 0, data: data, });
}
function responseEnd(res, chunk, contentType) {
  res.writeHead(200, { 'Content-Type': contentType || contentTypes.text });
  res.write(chunk);
  res.end();
}

module.exports = {
  contentTypes,
  jsonResult,
  responseEnd,
};
