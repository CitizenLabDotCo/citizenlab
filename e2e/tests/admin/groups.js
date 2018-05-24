const crypto = require('crypto');
const afterEach = require('../../updateBSStatus');
const hash = crypto.randomBytes(5).toString('hex');

module.exports = {
  '@tags': ['groups', 'city'],
  afterEach,
  newNormalGroup: (browser) => {
    const signinPage = browser.page.signin();
    const usersPage = browser.page.users();

    const groupTitle = `Normal group ${hash}`;

    signinPage
      .navigate()
      .signin('koen@citizenlab.co', 'testtest');

    usersPage
      .navigate()
      .newNormalGroup(groupTitle);

    usersPage
      .waitForElementVisible('@groupsList')
      .expect.element('@groupsList').text.to.contain(groupTitle);

    browser.end();
  },
  newRulesGroup: (browser) => {
    const signinPage = browser.page.signin();
    const usersPage = browser.page.users();

    const groupTitle = `Rules group ${hash}`;

    signinPage
      .navigate()
      .signin('koen@citizenlab.co', 'testtest');

    usersPage
      .navigate()
      .newRulesGroup(groupTitle);

    usersPage
      .waitForElementVisible('@groupsList')
      .expect.element('@groupsList').text.to.contain(groupTitle);

    browser.end();
  },
};
