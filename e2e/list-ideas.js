module.exports = {
  visibleIdeas: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#ideas-filters', 5000)
    .waitForElementVisible('#ideas-list', 5000)
    .waitForElementVisible('.idea-card', 5000)
    .end();
  },

  changeOrder: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#ideas-list', 5000)
    .click('#filter-sort')
    .waitForElementVisible('')
    .end();
  },
};
