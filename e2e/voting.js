module.exports = {
  voting: (browser) => {
    let ideaUrl;

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
    .url((location) => {
      ideaUrl = location;
    })
    .url(ideaUrl)
    .waitForElementVisible('#idea-show .vote-controls')
    .click('.upvote')
    .waitForElementVisible('.vote-controls.up')
    .click('.downvote')
    .waitForElementVisible('.vote-controls.down')
    .click('.downvote')
    .waitForElementVisible('.vote-controls.neutral')
    .end();
  },
};
