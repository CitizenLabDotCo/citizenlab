const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas', 'comments', 'bleh'],
  afterEach,
  seeComments: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('.e2e-idea-card.e2e-has-comments')
    .click('.e2e-idea-card.e2e-has-comments')
    .waitForElementVisible('#e2e-idea-show')
    .refresh()
    .waitForElementVisible('.e2e-comments')
    .end();
  },

  postComment: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('.e2e-idea-card.e2e-comments-enabled')
    .click('.e2e-idea-card.e2e-comments-enabled')
    .waitForElementVisible('#e2e-idea-show')
    .refresh()
    .waitForElementVisible('.e2e-comment-form')
    .setValue('.e2e-comment-form textarea', `Test Comment ${hash}`)
    .click('.e2e-comment-form .e2e-submit-comment')
    .pause(1000)
    .waitForElementVisible('.e2e-comment-thread')
    .assert.containsText(`.e2e-comment-body.last div`, `Test Comment ${hash}`)
    .end();
  },
};
