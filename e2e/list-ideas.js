module.exports = {
  visibleIdeas: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#ideas-filters')
    .waitForElementVisible('#ideas-list')
    .waitForElementVisible('.idea-card:first-child')
    .end();
  },

  changeOrder: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#ideas-list')
    .click('.filter-selector-sort button')
    .waitForElementVisible('.filter-selector-sort ul')
    .click('.filter-selector-sort ul li:last-child')
    .waitForElementVisible('#ideas-list')
    .end();
  },
};
