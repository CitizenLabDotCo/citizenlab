const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas', 'single-idea'],
  afterEach,
  modalIdea: (browser) => {
    let ideaUrl;

    browser
    .url(`http://${process.env.ROOT_URL}`)
    .waitForElementVisible('#e2e-ideas-container')
    .waitForElementVisible('#e2e-ideas-list>:first-child')
    .execute('var element = document.getElementsByClassName("e2e-idea-card");element[0].scrollIntoView(true);')
    .click('.e2e-idea-card')
    .waitForElementVisible('#e2e-fullscreenmodal-content')
    .waitForElementVisible('#e2e-idea-show')
    .url((location) => {
      ideaUrl = location;
    })
    .url(ideaUrl)
    .waitForElementVisible('#e2e-idea-show')
    .end();
  },
};
