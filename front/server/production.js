const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const {
  API_HOST,
  API_PORT,
  GRAPHQL_HOST,
  GRAPHQL_PORT,
} = require('./getApiData');

const app = express();

// Gzip compression
app.use(compression());

// Redirects API requests
app.use(
  createProxyMiddleware({
    target: `http://${API_HOST}:${API_PORT}`,
    pathFilter: ['/web_api', '/auth', '/uploads'],
  })
);
app.use(
  createProxyMiddleware({
    target: `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
    pathFilter: '/admin_templates_api',
  })
);
app.use(
  createProxyMiddleware({
    target: `http://${API_HOST}:3200`,
    pathFilter: '/widgets',
  })
);

// Serve static files
app.use(express.static('build'));

app.use('/fragments/*', function (req, res) {
  res.sendStatus(404);
});

app.use('*', function (req, res) {
  res.sendFile(path.resolve('build/index.html'));
});

app.listen(3000, () => {
  console.log('Serving production build on port 3000');
});
