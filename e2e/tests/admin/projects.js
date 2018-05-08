const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');
const afterEach = require('../../updateBSStatus');

module.exports = {
  '@tags': ['city', 'projects', 'projects-basics'],
  afterEach,
  projectsList: (browser) => {
    const signinPage = browser.page.signin();
    const adminProjectsPage = browser.page.adminProjects();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    adminProjectsPage
    .navigate()
    .waitForElementVisible('@projectsList')
    .waitForElementVisible('@addProjectButton')
    .waitForElementVisible('@projectListItem');

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
    .waitForElementVisible('@addProjectButton')
    .click('@addProjectButton')
    .waitForElementVisible('@generalForm');

    browser.fillMultiloc('#project-title', `Test Project ${hash}`);

    adminProjectsPage
    .click('@submitButton')

    // Test the back to projects overview redirect
    .waitForElementVisible('.e2e-admin-projects-list .e2e-admin-list-row');

    // Wait for stream updates
    browser.pause(1500);

    adminProjectsPage
    .assert.containsText('.e2e-admin-projects-list', `Test Project ${hash}`)
    .click('.e2e-admin-projects-list .e2e-admin-list-row .e2e-admin-edit-project a')

    // Test for the description insertion
    .waitForElementVisible('@descriptionTab')
    .click('@descriptionTab')
    .waitForElementVisible('.e2e-project-description-form');

    browser.fillMultiloc('#description-preview', 'Test Description Preview');
    browser.fillMultiloc('#project-description', 'Test Description please ignore');

    adminProjectsPage
    .click('@submitButton')
    .waitForElementVisible('@submitSuccess');

    browser
    .end();
  },
};
