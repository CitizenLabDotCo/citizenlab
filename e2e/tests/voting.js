const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'ideas', 'voting'],
  afterEach,
  voting: (browser) => {
    // sign in first to be able to vote
    browser.page.signin()
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    // navigate to /ideas page
    browser.page.ideas()
    .navigate()
    .seeNewest();

    // vote
    browser
    .waitForElementVisible('#e2e-ideas-list')
    .click('#e2e-ideas-list .e2e-voting-enabled .downvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.down')
    .click('#e2e-ideas-list .e2e-voting-enabled .upvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.up')
    .click('#e2e-ideas-list .e2e-voting-enabled .upvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.neutral')
    .end();
  },
};
