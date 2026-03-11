const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { API_HOST, API_PORT } = require('./getApiData');

const app = express();

app.use(
  createProxyMiddleware({
    target: `http://${API_HOST}:${API_PORT}`,
    pathFilter: '/uploads',
  })
);

app.listen(4000, () => {
  console.log('Image upload proxy started on port 4000');
});
