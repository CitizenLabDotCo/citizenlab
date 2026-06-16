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

// Match proxied prefixes only on path-segment boundaries, so a backend prefix
// like /auth does not also capture static asset chunks that merely start with
// the same characters (e.g. /authUserStream.<hash>.chunk.js, which would be
// proxied to the backend and 504). Mirrors the trailing-slash dev proxy keys
// in vite.config.ts.
const onSegmentBoundary =
  (...prefixes) =>
  (pathname) =>
    prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

// Redirects API requests
app.use(
  createProxyMiddleware({
    target: `http://${API_HOST}:${API_PORT}`,
    pathFilter: onSegmentBoundary('/web_api', '/auth', '/uploads'),
  })
);
app.use(
  createProxyMiddleware({
    target: `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
    pathFilter: onSegmentBoundary('/admin_templates_api'),
  })
);
app.use(
  createProxyMiddleware({
    target: `http://${API_HOST}:3200`,
    pathFilter: onSegmentBoundary('/widgets'),
  })
);

// Serve static files
app.use(express.static('build'));

app.use('/fragments/*splat', function (req, res) {
  res.sendStatus(404);
});

app.use(function (req, res) {
  res.sendFile(path.resolve('build/index.html'));
});

app.listen(3000, () => {
  console.log('Serving production build on port 3000');
});
