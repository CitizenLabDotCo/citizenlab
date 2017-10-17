module.exports = {
  modalIdea: (browser) => {
    let ideaUrl;

    browser
    .url('localhost:3000')
    .waitForElementVisible('#e2e-ideas-container', 5000)
    .waitForElementVisible('#e2e-ideas-list:first-child', 5000)
    .click('#e2e-ideas-list:first-child')
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
