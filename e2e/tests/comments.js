const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas', 'comments'],
  afterEach,

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
    .execute('var submitComment = document.getElementsByClassName("e2e-submit-comment");submitComment[0].scrollIntoView(true);')
    .click('.e2e-comment-form .e2e-submit-comment')
    .waitForElementVisible('.Button.disabled')
    .waitForElementVisible('.e2e-comment-thread')
    .assert.containsText(`.e2e-comment-body.last div`, `Test Comment ${hash}`)
    .end();
  },
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
};
