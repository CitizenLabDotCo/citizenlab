const time = new Date().getTime();

const LATEST_COMMENT = '.e2e-comments-container > *:first-child';

module.exports = {
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
    .setValue('.e2e-comment-form .textarea', `Test Comment ${time}`)
    .click('.e2e-comment-form .e2e-submit-comment')
    .pause(1000)
    .waitForElementVisible(LATEST_COMMENT)
    .assert.containsText(`${LATEST_COMMENT} .e2e-comment-body`, `Test Comment ${time}`)
    .end();
  },
};
