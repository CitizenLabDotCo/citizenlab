function goToHomepageBuilder() {
  cy.setAdminLoginCookie();
  cy.visit('en/admin/pages-menu/homepage-builder');
}

function interceptHomepageUpdate() {
  cy.intercept(
    'POST',
    '**/home_pages/content_builder_layouts/homepage/upsert'
  ).as('updateHomepage');
}

function verifyHomepageUpdateSuccess() {
  cy.wait('@updateHomepage').its('response.statusCode').should('eq', 200);
}

function cleanUpWidget() {
  goToHomepageBuilder();
  cy.dataCy('e2e-areas-widget').first().parent().click({ force: true });
  cy.get('#e2e-delete-button').click();
  interceptHomepageUpdate();
  cy.get('#e2e-content-builder-topbar-save').click();
  verifyHomepageUpdateSuccess();
  cy.log('Cleaned up Areas Widget');

  // Make sure it's not on homepage
  cy.goToLandingPage();
  cy.reload();
  cy.wait(1000);
  cy.dataCy('e2e-areas-widget').should('not.exist');
}

function addWidget() {
  goToHomepageBuilder();
  // Drag in widget
  cy.get('#e2e-draggable-areas').dragAndDrop('#e2e-content-builder-frame', {
    position: 'inside',
  });

  // Save
  interceptHomepageUpdate();
  cy.get('#e2e-content-builder-topbar-save').click();
  verifyHomepageUpdateSuccess();
  cy.log('Added Areas Widget');
}

function toggleFollowArea() {
  // Go to the homepage
  cy.goToLandingPage();
  // Necessary to ensure our widget is loaded
  cy.reload();

  // Opens the modal
  cy.dataCy('e2e-follow-areas-button').click();

  // Area selection
  cy.contains('button', 'Carrotgem').should('be.visible').click();

  // Ensure modal closes
  cy.dataCy('e2e-follow-areas-modal-done-button').should('be.visible').click();
}

describe('"In your area" (areas) widget', () => {
  const projectTitleEN = 'Project linked to Carrotgem area';

  beforeEach(() => {
    addWidget();
  });

  afterEach(() => {
    // Unfollow area again
    toggleFollowArea();
    // Does not show project with title "Project linked to Carrotgem area" in widget anymore
    cy.dataCy('e2e-areas-widget')
      .find('[data-cy="e2e-areas-widget-empty-state"]')
      .should('be.visible');

    cleanUpWidget();
  });

  it('shows projects of the areas I follow', () => {
    // Create project with area
    cy.visit('/admin/projects/all');
    cy.dataCy('e2e-new-project-button').should('be.visible').click();
    cy.get('.e2e-project-general-form');

    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-NL').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.fr-BE').click();
    cy.get('#e2e-project-title-setting-field').type(projectTitleEN);

    // Select 'Selection' as Areas option
    cy.get('.e2e-areas-selection').click();

    // Pick area
    cy.get('#e2e-area-selector')
      .click()
      .find('input')
      .type('Carrotgem')
      .trigger('keydown', { keyCode: 13, which: 13 });

    // Submit and publish project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.get('#e2e-publish').click();

    toggleFollowArea();

    // Shows the project with title "Project linked to Carrotgem area"
    cy.dataCy('e2e-areas-widget')
      .find('[data-cy="e2e-light-project-card"]')
      .should('contain', projectTitleEN);
  });
});
