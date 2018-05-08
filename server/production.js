const express = require('express');
const request = require('request');
const compression = require('compression');
const { API_HOST, API_PORT } = require('./getApiData');

const app = express();

// Gzip compression
app.use(compression());

// Redirects API requests
app.use('/web_api', (req, res) => {
  req.pipe(request(`http://${API_HOST}:${API_PORT}/web_api/${req.url}`)).pipe(res);
});
app.use('/auth', (req, res) => {
  req.pipe(request(`http://${API_HOST}:${API_PORT}/auth/${req.url}`)).pipe(res);
});

// Serve static files
app.use(express.static('build'));

app.listen(3000, () => {
  console.log('Serving production build on port 3000'); // eslint-disable-line no-console
});
