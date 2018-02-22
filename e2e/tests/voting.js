module.exports = {
  '@tags': ['citizen', 'ideas', 'voting'],
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
    .click('#e2e-ideas-list:first-child .e2e-idea-card .downvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.down')
    .click('#e2e-ideas-list:first-child .e2e-idea-card .upvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.up')
    .click('#e2e-ideas-list:first-child .e2e-idea-card .upvote')
    .pause(1000)
    .waitForElementVisible('.e2e-vote-controls.neutral')
    .end();
  },
};
