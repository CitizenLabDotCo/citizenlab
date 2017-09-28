module.exports = {
  visibleIdeas: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#e2e-ideas-filters')
    .waitForElementVisible('#e2e-ideas-list')
    .waitForElementVisible('.e2e-idea-card:first-child')
    .end();
  },

  changeOrder: (browser) => {
    browser
    .url('localhost:3000/ideas')
    .waitForElementVisible('#e2e-ideas-list')
    .click('.e2e-filter-selector-sort button')
    .waitForElementVisible('.e2e-filter-selector-sort ul')
    .click('.e2e-filter-selector-sort ul li:last-child')
    .waitForElementVisible('#e2e-ideas-list')
    .end();
  },
};
