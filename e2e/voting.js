module.exports = {
  voting: (browser) => {
    // Signin first to be able to vote
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-landing-page')
    .url('localhost:3000/ideas?sort=new')
    .waitForElementVisible('.e2e-idea-card:first-child')
    .click('.e2e-idea-card.not-voted')
    .waitForElementVisible('#e2e-idea-show')
    .refresh()
    .waitForElementVisible('#e2e-idea-show .e2e-vote-controls')
    .click('.e2e-vote-controls .upvote')
    .waitForElementVisible('.e2e-vote-controls.up')
    .waitForElementVisible('.e2e-vote-controls .downvote')
    .pause(200)
    .click('.e2e-vote-controls .downvote')
    .waitForElementVisible('.e2e-vote-controls.down')
    .waitForElementVisible('.e2e-vote-controls .downvote')
    .pause(200)
    .click('.e2e-vote-controls .downvote')
    .waitForElementVisible('.e2e-vote-controls.neutral')
    .end();
  },
};
