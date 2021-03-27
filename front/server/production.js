const express = require('express');
const request = require('request');
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
app.use('/web_api', (req, res) => {
  req
    .pipe(request(`http://${API_HOST}:${API_PORT}/web_api/${req.url}`))
    .pipe(res);
});
app.use('/admin_templates_api', (req, res) => {
  req
    .pipe(
      request(
        `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}/admin_templates_api/${req.url}`
      )
    )
    .pipe(res);
});
app.use('/auth', (req, res) => {
  req.pipe(request(`http://${API_HOST}:${API_PORT}/auth/${req.url}`)).pipe(res);
});
app.use('/uploads', function (req, res) {
  req
    .pipe(request(`http://${API_HOST}:${API_PORT}/uploads/${req.url}`))
    .pipe(res);
});
app.use('/widgets', function (req, res) {
  req.pipe(request(`http://${API_HOST}:3200/${req.url}`)).pipe(res);
});

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
