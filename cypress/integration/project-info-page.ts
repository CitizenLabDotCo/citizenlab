describe('Project selection page', () => {
  beforeEach(() => {
    cy.visit('/projects/test-project-1-timeline-with-file/info');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-info');
  });

  it('shows where you are', () => {
    cy.get('.e2e-projects-dropdown-link')
      .should('have.class', 'active')
      .should('be.visible');
    cy.get('.e2e-project-info-link')
      .should('have.class', 'active')
      .should('be.visible');
  });

  it('shows the project title', () => {
    cy.get('.e2e-project-header-content').contains('Test project 1');
  });

  it('shows the project description', () => {
    cy.get('.e2e-project-info').contains(
      "Let's renew the parc at the city border and make it an enjoyable place for young and old."
    );
  });

  it('shows a functional download buton for the project file', () => {
    cy.get('.e2e-project-info')
      .contains('20190110_rueil_intermediaire.pdf')
      .should('have.attr', 'href');
  });

  it('shows the project images', () => {
    cy.get('.e2e-project-info')
      .find('.e2e-project-images')
      .find('img')
      .should('have.length', 3);
  });

  it('shows a twitter sharing button', () => {
    cy.get('.e2e-project-info').find('.sharingButton.twitter');
  });
});
