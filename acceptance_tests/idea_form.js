var expect = require('chai').expect
var I = null

describe('Idea Form', function () {
  this.timeout(10000)

  beforeEach(function() {
    I = require('./support/web_user_helper')('http://localhost:3000')
  })

  afterEach(function(done) {
    I.driver.quit().then(() => { done() })
  })

  it('create a new idea', function () {
   I.visit('/ideas')
   I.shouldSee('Total 1 ideas')
   I.find('css', '.clIdeaFormHeading').sendKeys('Eureka')
   I.find('css', '.clIdeaFormDescription').sendKeys('I like to suggest...')
   I.find('tagName', 'button').click()
   return I.shouldSee('Total 2 ideas')
  })
})
