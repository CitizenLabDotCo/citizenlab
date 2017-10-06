module.exports = {
  postIdea: (browser) => {
    const title = `test idea ${new Date().getTime()}`;

    const signinPage = browser.page.signin();
    const newIdeaPage = browser.page.newIdea();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    newIdeaPage
    .navigate()
    .postIdea(title, 'Lorem ipsum dolor sit amet');

    browser
    .url('localhost:3000/ideas?sort=new')
    .waitForElementVisible('.e2e-idea-card:first-child')
    .getText('.e2e-idea-card:first-child h4', function (result) {
      this.assert.equal(result.value, title);
    })
    .end();
  },
};
