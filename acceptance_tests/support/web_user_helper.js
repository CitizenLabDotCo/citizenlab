var expect = require('chai').expect
var webdriver = require('selenium-webdriver')
var By = webdriver.By

module.exports = function (baseUrl) {
  var I = {}

  var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build()

  I.driver = driver
  I.find = function (method, selector) {
    return driver.findElement(By[method](selector))
  }

  I.visit = function (path) {
    return I.driver.get(baseUrl + path)
  }

  I.shouldSee = function (text) {
    return I.driver.findElement(By.css('body')).getText().then(function (pageText) {
      expect(pageText).to.contain(text)
    })
  }

  return I
}
