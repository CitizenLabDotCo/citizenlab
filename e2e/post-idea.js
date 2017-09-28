module.exports = {
  postIdea: (browser) => {
    const title = `test idea ${new Date().getTime()}`;
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-landing-page')
    .click('.e2e-add-idea-button')
    .waitForElementVisible('#new-idea-form')
    .setValue('#title', title)
    .setValue('.public-DraftEditor-content', 'Lorem ipsum dolor sit amet')
    .click('.e2e-submit-idea-form')
    .waitForElementVisible('#e2e-ideas-container')
    .url('localhost:3000/ideas?sort=new')
    .waitForElementVisible('.e2e-idea-card:first-child')
    .getText('.e2e-idea-card:first-child h4', function (result) {
      this.assert.equal(result.value, title);
    })
    .end();
  },
};
