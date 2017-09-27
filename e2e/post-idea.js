module.exports = {
  postIdea: (browser) => {
    const title = `test idea ${new Date().getTime()}`;
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#landing-page')
    .click('button.add-idea-button')
    .waitForElementVisible('#new-idea-form')
    .setValue('#title', title)
    .setValue('.public-DraftEditor-content', 'Lorem ipsum dolor sit amet')
    .click('button.submit-idea-form')
    .waitForElementVisible('#ideas-container')
    .url('localhost:3000/ideas?sort=new')
    .waitForElementVisible('.idea-card:first-child')
    .getText('.idea-card:first-child h4', function (result) {
      this.assert.equal(result.value, title);
    })
    .end();
  },
};
