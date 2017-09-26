module.exports = {
  modalIdea: (browser) => {
    let ideaUrl;

    browser
    .url('localhost:3000')
    .waitForElementVisible('.idea-card:first-child')
    .click('.idea-card:first-child')
    .waitForElementVisible('#modal-container')
    .waitForElementVisible('#idea-show')
    .url((location) => {
      ideaUrl = location;
    })
    .url(ideaUrl)
    .waitForElementVisible('#idea-show')
    .end();
  },
};
