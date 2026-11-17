describe('Project template request errors', () => {
  beforeEach(() => cy.setConsentAndAdminLoginCookies());

  it('shows a request error and retries instead of claiming the catalogue is empty', () => {
    let failing = true;
    cy.intercept('POST', '**/admin_templates_api/graphql', (request) => {
      if (failing) {
        request.reply({ statusCode: 405, body: 'Not allowed' });
      } else {
        request.reply({
          data: {
            publishedProjectTemplates: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }
    }).as('templates');
    cy.visit('/admin/projects?project_backoffice_redesign');
    cy.contains('button', 'New project').click();
    cy.contains('Use a template').click();
    cy.wait('@templates');
    cy.get('[role="dialog"]').should(
      'contain',
      'Templates could not be loaded. Please try again.'
    );
    cy.get('[role="dialog"]').should(
      'not.contain',
      'There are no projects available.'
    );
    cy.then(() => {
      failing = false;
    });
    cy.get('[role="dialog"]').contains('button', 'Try again').click();
    cy.wait('@templates');
    cy.get('[role="dialog"]').should(
      'not.contain',
      'Templates could not be loaded'
    );
    cy.get('[role="dialog"]').should(
      'contain',
      'There are no projects available.'
    );
  });
});
