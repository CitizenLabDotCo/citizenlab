const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const title = `test idea ${hash}`;

module.exports = {
  '@tags': ['citizen', 'ideas'],
  postIdea: (browser) => {
    const signinPage = browser.page.signin();
    const newIdeaPage = browser.page.newIdea();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    newIdeaPage
    .navigate()
    .postIdea(title, 'Lorem ipsum dolor sit amet');

    browser
    .url('localhost:3000')
    .pause(500)
    .waitForElementVisible('#e2e-ideas-list:first-child')
    .getText('#e2e-ideas-list:first-child h4 span', function (result) {
      this.assert.equal(result.value, title);
    });

    browser
    .url('localhost:3000/ideas')
    .pause(500)
    .waitForElementVisible('#e2e-ideas-list:first-child')
    .getText('#e2e-ideas-list:first-child h4 span', function (result) {
      this.assert.equal(result.value, title);
    })
    .end();
  },
};
