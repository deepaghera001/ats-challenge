const puppeteer = require('puppeteer');

module.exports = async function globalSetup() {
  global.__BROWSER__ = await puppeteer.launch();
  process.env.PUPPETEER_WS_ENDPOINT = global.__BROWSER__.wsEndpoint();
};

module.exports.teardown = async function globalTeardown() {
  await global.__BROWSER__.close();
};