const commands = {
  searchText(text) {
    return this
    .waitForElementVisible('@searchInput')
    .setValue('@searchInput', text)
    .click('@searchButton')
    .waitForElementVisible('@ideasContainer');
  },
};

module.exports = {
  url: 'localhost:3000/ideas',
  elements: {
    filters: { selector: '#e2e-ideas-filters' },
    firstIdea: { selector: '.e2e-idea-card:first-child' },
    ideasContainer: { selector: '#e2e-ideas-container' },
    ideasList: { selector: '#e2e-ideas-list' },
    searchButton: { selector: '.e2e-ideas-search-button' },
    searchInput: { selector: '#e2e-ideas-search' },
  },
  commands: [commands],
};
