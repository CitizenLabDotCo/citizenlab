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

  it('shows an error when the templates service reports a failed export or import', () => {
    const template = {
      id: 'template-id',
      cardImage: null,
      titleMultiloc: { en: 'Template to apply' },
      subtitleMultiloc: { en: 'Subtitle' },
      departments: [],
      purposes: [],
      participationLevels: [],
    };

    cy.intercept('POST', '**/admin_templates_api/graphql', (request) => {
      const query: string = request.body.query;

      if (query.includes('applyProjectTemplate')) {
        request.alias = 'applyTemplate';
        request.reply({
          data: {
            applyProjectTemplate: {
              errors: ["Can't export project template template-id from source"],
            },
          },
        });
      } else if (query.includes('publishedProjectTemplates')) {
        request.reply({
          data: {
            publishedProjectTemplates: {
              nodes: [template],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      } else {
        request.reply({
          data: {
            projectTemplate: template,
            departments: { nodes: [] },
            purposes: { nodes: [] },
            participationLevels: { nodes: [] },
          },
        });
      }
    });

    cy.visit('/admin/projects?project_backoffice_redesign');
    cy.contains('button', 'New project').click();
    cy.contains('Use a template').click();
    // The card only reveals its buttons on CSS hover, which Cypress cannot
    // trigger.
    cy.contains('button', 'Use template').click({ force: true });

    cy.get('#project-title').type('Project from a template');
    cy.get('#project-start-date button').click();
    cy.get('[role="dialog"] [role="grid"] [data-today]').first().click();
    // The pressed day keeps focus, so Escape reaches the calendar popover.
    cy.focused().should('have.attr', 'role', 'button').type('{esc}');
    cy.get('[role="dialog"] [role="grid"]').should('not.exist');
    cy.contains('button', 'Create project').click();

    cy.wait('@applyTemplate');
    cy.contains('[role="dialog"]', 'Oops, something went wrong.');
    cy.contains('button', 'Create project').should('exist');
  });
});
