const time = new Date().getTime();

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
    .waitForElementVisible('.e2e-comments', 10000)
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
    .waitForElementVisible('.e2e-comments', 10000)
    .setValue('.textarea', `Test Comment ${time}`)
    .click('.e2e-submit-comment')
    // .waitForElementVisible('.e2e-comment-form .e2e-success-message')
    .pause(1000)
    .assert.containsText('.e2e-comment-thread:last-child .e2e-comment-body', `Test Comment ${time}`)
    .end();
  },
};
