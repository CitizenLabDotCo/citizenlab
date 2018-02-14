const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');

module.exports = {
  '@tags': ['city', 'projects', 'zolg'],
  projectsList: (browser) => {
    const signinPage = browser.page.signin();
    const adminProjectsPage = browser.page.adminProjects();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    adminProjectsPage
    .navigate()
    .waitForElementVisible('@projectsList')
    .waitForElementVisible('@newProject')
    .waitForElementVisible('@projectCard');

    browser
    .end();
  },

  createNewProject: (browser) => {
    const signinPage = browser.page.signin();
    const adminProjectsPage = browser.page.adminProjects();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    adminProjectsPage
    .navigate()
    .waitForElementVisible('@newProject')
    .click('@newProject')
    .waitForElementVisible('@generalForm')
    .assert.urlEquals('http://localhost:3000/admin/projects/new')
    .setValue('#project-title', `Test Project ${hash}`)
    .click('@submitButton')

    // Test the back to projects overview redirect
    .waitForElementVisible('.e2e-projects-list .e2e-project-card');

    // Wait for stream updates
    browser.pause(1000);

    adminProjectsPage
    .assert.containsText('.e2e-projects-list .e2e-project-card h1 span', `Test Project ${hash}`)
    .click('.e2e-projects-list .e2e-project-card a')

    // Test for the description insertion
    .waitForElementVisible('@descriptionTab')
    .click('@descriptionTab')
    .waitForElementVisible('.e2e-project-description-form')
    .setValue('.public-DraftEditor-content', 'Test Description please ignore')
    .click('@submitButton')
    .waitForElementVisible('@submitSuccess');

    browser
    .end();
  },
};
