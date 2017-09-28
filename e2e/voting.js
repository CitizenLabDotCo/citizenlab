module.exports = {
  voting: (browser) => {
    // Signin first to be able to vote
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#landing-page')
    .url('localhost:3000/ideas?sort=new')
    .waitForElementVisible('.idea-card:first-child')
    .click('.idea-card.not-voted')
    .waitForElementVisible('#idea-show')
    .refresh()
    .waitForElementVisible('#idea-show .vote-controls')
    .click('.vote-controls .upvote')
    .waitForElementVisible('.vote-controls.up')
    .waitForElementVisible('.vote-controls .downvote')
    .pause(100)
    .click('.vote-controls .downvote')
    .waitForElementVisible('.vote-controls.down')
    .waitForElementVisible('.vote-controls .downvote')
    .pause(100)
    .click('.vote-controls .downvote')
    .waitForElementVisible('.vote-controls.neutral')
    .end();
  },
};
