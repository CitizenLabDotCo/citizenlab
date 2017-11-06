const time = new Date().getTime();
const title = `Test Phase ${time}`;
const startDate = '2017-11-05';
const endDate = '2017-11-12';

module.exports = {
  '@tags': ['city', 'projects', 'phases'],
  createPhase: (browser) => {
    const signinPage = browser.page.signin();
    const adminProjectsPage = browser.page.adminProjects();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    adminProjectsPage
    .navigate()
    .openLastProject()
    .waitForElementVisible('@phasesTab')
    .click('@phasesTab')
    .waitForElementVisible('@addPhaseButton')
    .click('@addPhaseButton')

    // Phase insertion form
    .assert.urlContains('/timeline/new')
    .setValue('#title', title)
    .setValue('#startDate', startDate)
    .setValue('#endDate', endDate)
    .setValue('.public-DraftEditor-content', 'Lorem ipsum dolor sit amet')
    .click('@submitButton')
    .waitForElementVisible('@submitSuccess')

    // Check for phase presence in the list
    .click('@phasesTab')
    .assert.containsText('.e2e-phases-table', title);

    browser.end();
  },
};
