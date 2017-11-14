module.exports = {
  '@tags': ['citizen', 'ideas'],
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
    .click('.e2e-filter-selector-button')
    .waitForElementVisible('.e2e-filter-selector-dropdown-list')
    .click('.e2e-filter-selector-dropdown-list li:last-child')
    .waitForElementVisible('#e2e-ideas-container')
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
    const title = `test idea ${new Date().getTime()}`;
    const content = `Test Content ${new Date().getTime()}`;

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
