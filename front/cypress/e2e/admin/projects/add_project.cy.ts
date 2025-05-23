import { randomString } from '../../../support/commands';

function waitForProjectToHaveArea(projectId: string, maxRetries = 5) {
  let retries = 0;

  function check(): Cypress.Chainable<any> {
    return cy.getProjectById(projectId).then((res) => {
      const areaData = res.body?.data?.relationships?.areas?.data;
      if (!areaData || areaData.length === 0) {
        if (retries < maxRetries) {
          retries++;
          cy.wait(1000);
          return check();
        } else {
          throw new Error('Area data not found on project after retries');
        }
      }
      return res;
    });
  }

  return check();
}

describe('Admin: add project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/all');
    cy.acceptCookies();
    cy.get('[data-cy="e2e-new-project-button"]').click();
    cy.get('.e2e-project-general-form').should('exist');
  });

  context('Type: Timeline', () => {
    context.skip('Areas: All areas', () => {
      it('creates a draft project by default', () => {
        const projectTitleEN = randomString();
        const projectTitleNLBE = randomString();
        const projectTitleNLNL = randomString();
        const projectTitleFRBE = randomString();

        // Fill in all locales
        cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
        cy.get('.e2e-localeswitcher.nl-BE').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLBE);
        cy.get('.e2e-localeswitcher.nl-NL').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLNL);
        cy.get('.e2e-localeswitcher.fr-BE').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleFRBE);

        // Submit form
        cy.get('.e2e-submit-wrapper-button button').click();

        // Confirm the project is saved and appears as draft
        cy.url().should('include', '/admin/projects/');
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

        // Fill in all locales
        cy.get('#e2e-project-title-setting-field').type(projectTitleEN);
        cy.get('.e2e-localeswitcher.nl-BE').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLBE);
        // cy.get('.e2e-localeswitcher.nl-NL').should('be.visible').click();
        // cy.get('#e2e-project-title-setting-field').type(projectTitleNLNL);
        cy.get('.e2e-localeswitcher.fr-BE').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleFRBE);

        // Select 'Selection' as Areas option
        cy.get('.e2e-areas-selection').click();

        // Select specific area
        cy.get('#e2e-area-selector')
          .click()
          .find('input')
          .type('East Anna')
          .trigger('keydown', { keyCode: 13, which: 13 });

        // Submit
        cy.get('.e2e-submit-wrapper-button button').click();

        // Wait for network call and extract project ID
        cy.wait('@createProject').then((interception) => {
          const projectId = interception.response?.body?.data?.id;
          expect(projectId).to.exist;

          // Retry until area appears on the project
          return waitForProjectToHaveArea(projectId)
            .then((projectData) => {
              const areaId =
                projectData.body.data.relationships.areas.data[0].id;
              expect(areaId).to.exist;

              // Get area details
              return cy.getArea(areaId);
            })
            .then((areaData) => {
              const areaName =
                areaData.body.data.attributes.title_multiloc['en'];
              expect(areaName).to.eq('East Anna');
            });
        });
      });
    });
  });
});
