const commands = {
  searchText(text) {
    return this
    .waitForElementPresent('@searchInput')
    .setValue('@searchInput', text)
    .waitForElementVisible('@ideasContainer');
  },

  seeNewest() {
    return this
    .waitForElementVisible('@ideasList')
    .waitForElementVisible('@sortFilter')
    .click('#e2e-ideas-sort-filter .e2e-filter-selector-button')
    .waitForElementVisible('.e2e-filter-selector-dropdown-list')
    .click('.e2e-filter-selector-dropdown-list li:nth-child(3)')
    .waitForElementVisible('@firstIdea', 10000);
  },
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/ideas`,
  elements: {
    filters: { selector: '#e2e-ideas-filters' },
    sortFilter: { selector: '#e2e-ideas-sort-filter' },
    firstIdea: { selector: '#e2e-ideas-list :first-child' },
    ideasContainer: { selector: '#e2e-ideas-container' },
    ideasList: { selector: '#e2e-ideas-list' },
    searchInput: { selector: '#e2e-ideas-search' },
  },
  commands: [commands],
};
