// Proxy API requests when running in production mode
const API_HOST = process.env.API_HOST || (typeof window === "undefined" ? 'localhost' : window.location.hostname);
const API_PORT = process.env.API_PORT || 4000;

module.exports = {
  API_HOST,
  API_PORT,
};
