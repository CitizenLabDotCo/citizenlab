const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas'],
  afterEach,
  visibleIdeas: (browser) => {
    const ideasPage = browser.page.ideas();

    ideasPage
    .navigate();

    browser
    .waitForElementVisible('#e2e-ideas-container')
    .end();
  },

  changeOrder: (browser) => {
    const ideasPage = browser.page.ideas();

    ideasPage
    .navigate();

    browser
    .waitForElementVisible('#e2e-ideas-container')
    .click('#e2e-ideas-sort-filter .e2e-filter-selector-button')
    .waitForElementVisible('.e2e-filter-selector-dropdown-list')
    .click('.e2e-filter-selector-dropdown-list li:last-child')
    .waitForElementVisible('#e2e-ideas-list')
    .end();
  },

  /*
  searchText: (browser) => {
    const ideasPage = browser.page.ideas();

    ideasPage
    .navigate()
    .searchText('test query string');

    browser
    .assert.urlContains(`search=${encodeURIComponent('test query string')}`)
    .end();
  },
  */

  searchSpecificIdea: (browser) => {
    const title = `test idea ${hash}`;
    const content = `Test Content ${hash}`;

    const signinPage = browser.page.signin();
    const newIdeaPage = browser.page.newIdea();
    const ideasPage = browser.page.ideas();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    newIdeaPage
    .navigate()
    .postIdea(title, content);

    ideasPage
    .navigate()
    .searchText(content)
    .waitForElementVisible('@firstIdea');

    browser
    .end();
  },
};
