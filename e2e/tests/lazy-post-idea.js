const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const title = `test idea ${hash}`;
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas', 'posting', 'lazy'],
  afterEach,
  lazyPostIdea: (browser) => {
    const signinPage = browser.page.signin();
    const newIdeaPage = browser.page.newIdea();

    newIdeaPage
    .navigate()
    .postIdea(title, 'Lorem ipsum dolor sit amet');

    signinPage
    .signin('koen@citizenlab.co', 'testtest')
    .waitForElementVisible('#e2e-ideas-list');

    browser
    .url(`http://${process.env.ROOT_URL}`)
    .pause(500)
    .waitForElementVisible('#e2e-ideas-list')
    .expect.element('#e2e-ideas-list').text.to.contain(title);

    browser.end();
  },
};
