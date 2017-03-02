var expect = require('chai').expect
var I = null

describe('Features', function () {
  this.timeout(10000)

  beforeEach(function() {
    I = require('./support/web_user_helper')('http://localhost:3000')
  })

  afterEach(function(done) {
    I.driver.quit().then(() => { done() })
  })

  context('User login', function () {
    it('login using facebook', function () {
      I.visit('/login')
      I.shouldSee('logged in? no')

      I.find('css', '.clLoginBtn').click()
      return I.shouldSee('logged in? yes')
    })
  })
})
