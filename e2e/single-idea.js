module.exports = {
  modalIdea: (browser) => {
    let ideaUrl;

    browser
    .url('localhost:3000')
    .waitForElementVisible('.e2e-idea-card:first-child')
    .click('.e2e-idea-card:first-child')
    .waitForElementVisible('#e2e-modal-container')
    .waitForElementVisible('#e2e-idea-show')
    .url((location) => {
      ideaUrl = location;
    })
    .url(ideaUrl)
    .waitForElementVisible('#e2e-idea-show')
    .end();
  },
};
