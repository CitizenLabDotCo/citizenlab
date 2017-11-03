const time = new Date().getTime();

module.exports = {
  projectsList: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .url('localhost:3000/admin/projects')
    .waitForElementVisible('.e2e-projects-list')
    .waitForElementVisible('.e2e-new-project')
    .waitForElementVisible('.e2e-project-card')
    .end();
  },

  createNewProject: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .url('localhost:3000/admin/projects')
    .waitForElementVisible('.e2e-projects-list')
    .waitForElementVisible('.e2e-new-project')
    .click('.e2e-new-project')
    .assert.urlEquals('http://localhost:3000/admin/projects/new')
    .setValue('#project-title', `Test Project ${time}`)
    .click('.e2e-submit-wrapper-button')
    .waitForElementVisible('.e2e-project-general-form')

    // Test for the description insertion
    .waitForElementVisible('.e2e-resource-tabs')
    .click('.e2e-resource-tabs li:nth-child(2)')
    .waitForElementVisible('.e2e-project-description-form')
    .setValue('.public-DraftEditor-content', 'Test Description please ignore')
    .click('.e2e-submit-wrapper-button')
    .waitForElementVisible('.e2e-submit-wrapper-button + .success')

    // Test for project presence in the list
    .click('.e2e-projects-list-link')
    .waitForElementVisible('.e2e-projects-list')
    .assert.urlEquals('http://localhost:3000/admin/projects')
    .assert.containsText('.e2e-projects-list', `Test Project ${time}`)
    .end();
  },
};
