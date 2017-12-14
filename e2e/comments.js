const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');

module.exports = {
  '@tags': ['citizen', 'ideas', 'comments'],
  seeComments: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-ideas-list')
    .click('#e2e-ideas-list:first-child')
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
    .waitForElementVisible('#e2e-ideas-list')
    .click('#e2e-ideas-list:first-child')
    .waitForElementVisible('#e2e-idea-show')
    .refresh()
    .waitForElementVisible('.e2e-comments')
    .setValue('.e2e-comment-form textarea', `Test Comment ${hash}`)
    .click('.e2e-comment-form .e2e-submit-comment')
    .pause(1000)
    .waitForElementVisible('.e2e-comment-thread')
    .assert.containsText(`.e2e-comment-body`, `Test Comment ${hash}`)
    .end();
  },
};
