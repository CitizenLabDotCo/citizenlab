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
  addUsersToNormalGroup: (browser) => {
    const signinPage = browser.page.signin();
    const usersPage = browser.page.users();

    signinPage
      .navigate()
      .signin('koen@citizenlab.co', 'testtest');

    usersPage
      .navigate()
      .expect.element('@firstGroupUserCount').text.to.equal(0)

      browser.getText('.e2e-user-table tbody tr:first-child td:nth-child(3)', (name) => {
        browser
          .click('.e2e-user-table tbody tr:first-child .e2e-checkbox')
          .click('.e2e-move-users')
          .click('.e2e-dropdown-item:first-child')
          .click('.e2e-dropdown-submit')
          .waitForElementNotPresent('.e2e-dropdown-submit')
          .click('.e2e-group-user-count');
        browser.expect.element('.e2e-group-user-count').text.to.equal(1)
        browser.expect.element('.e2e-user-table').text.to.contain(name.value);
      });
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

    // This assertion will break if the newly created group is not the last in the list anymore
    // We are testing that the number of users is a positive integer
    usersPage.expect.element('@firstGroupUserCount').text.to.match(/^[1-9]\d*$/);

    browser.end();
  },
};
