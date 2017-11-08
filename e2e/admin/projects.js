const time = new Date().getTime();

module.exports = {
  '@tags': ['city', 'projects'],
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
    .setValue('#project-title', `Test Project ${time}`)
    .click('@submitButton')
    .waitForElementVisible('@generalForm')

    // Test for the description insertion
    .waitForElementVisible('@descriptionTab')
    .click('@descriptionTab')
    .waitForElementVisible('.e2e-project-description-form')
    .setValue('.public-DraftEditor-content', 'Test Description please ignore')
    .click('@submitButton')
    .waitForElementVisible('@submitSuccess')

    // Test for project presence in the list
    .click('.e2e-projects-list-link')
    .waitForElementVisible('@projectsList')
    .assert.urlEquals('http://localhost:3000/admin/projects')
    .assert.containsText('@projectsList', `Test Project ${time}`);

    browser
    .end();
  },
};
