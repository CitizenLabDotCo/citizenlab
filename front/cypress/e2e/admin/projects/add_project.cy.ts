import { randomString } from '../../../support/commands';

describe('Admin: add project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/all');
    cy.acceptCookies();
    cy.get('[data-cy="e2e-new-project-button"]').click();
    cy.wait(1000);
    cy.get('.e2e-project-general-form');
  });

  context('Type: Timeline', () => {
    context('Areas: All areas', () => {
      it('creates a draft project by default', () => {
        const projectTitleEN = randomString();
        const projectTitleNLBE = randomString();
        const projectTitleNLNL = randomString();
        const projectTitleFRBE = randomString();

        // Type random project titles for these required fields
        cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
        cy.get('.e2e-localeswitcher.nl-BE').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLBE);
        cy.get('.e2e-localeswitcher.nl-NL').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLNL);
        cy.get('.e2e-localeswitcher.fr-BE').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleFRBE);

        // Submit project
        cy.get('.e2e-submit-wrapper-button button').click();

        cy.wait(2000);

        // Project should appear on top of the projects list
        cy.visit('/admin/projects/all');
        cy.get('#e2e-admin-projects-list-unsortable')
          .children()
          .first()
          .contains(projectTitleEN);
        cy.get('#e2e-admin-projects-list-unsortable')
          .children()
          .first()
          .contains('Draft');
      });
    });

    context('Areas: Selection', () => {
      it('creates a project with the correct area', () => {
        cy.intercept('POST', '**/web_api/v1/projects').as('createProject');

        const projectTitleEN = randomString();
        const projectTitleNLBE = randomString();
        const projectTitleNLNL = randomString();
        const projectTitleFRBE = randomString();

        // Type random project titles for these required fields
        cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
        cy.get('.e2e-localeswitcher.nl-BE').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLBE);
        cy.get('.e2e-localeswitcher.nl-NL').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLNL);
        cy.get('.e2e-localeswitcher.fr-BE').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleFRBE);

        // Select 'Selection' as Areas option
        cy.get('.e2e-areas-selection').click();

        // Pick (only) area
        cy.get('#e2e-area-selector')
          .click()
          .find('input')
          .type('East Anna')
          .trigger('keydown', { keyCode: 13, which: 13 });

        // Submit project
        cy.get('.e2e-submit-wrapper-button button').click();

        cy.wait(2000);

        // Wait for the project creation to finish and check the response
        cy.wait('@createProject').then((interception) => {
          const projectId = interception.response?.body.data.id;

          expect(projectId).to.exist;

          return cy
            .getProjectById(projectId)
            .then((projectData) => {
              const areaId =
                projectData.body.data.relationships.areas.data[0].id;
              return cy.getArea(areaId);
            })
            .then((areaData) => {
              const area = areaData.body.data.attributes.title_multiloc['en'];
              expect(area).to.eq('East Anna');
            });
        });
      });
    });
  });
});
