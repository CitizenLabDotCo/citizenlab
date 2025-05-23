import { randomString } from '../../../support/commands';

describe('Admin: add project', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/all');
    cy.acceptCookies();
    cy.dataCy('e2e-new-project-button').click();
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
        cy.get('.e2e-localeswitcher.nl-NL').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleNLNL);
        cy.get('.e2e-localeswitcher.fr-BE').should('be.visible').click();
        cy.get('#e2e-project-title-setting-field').type(projectTitleFRBE);

        // Select 'Selection' as Areas option
        cy.get('.e2e-areas-selection').click();

        // Select specific area
        cy.get('#e2e-area-selector')
          .click()
          .find('input')
          .type('Carrotgem')
          .trigger('keydown', { keyCode: 13, which: 13 });

        // Submit
        cy.get('.e2e-submit-wrapper-button button').click();

        // Expect an area to be passed in the project request
        cy.wait('@createProject').then((interception) => {
          expect(interception.request?.body.project.area_ids.length).to.equal(
            1
          );

          cy.getArea(interception.request?.body.project.area_ids[0]).then(
            (area) => {
              console.log({ area });
              expect(area.body.data.attributes.title_multiloc['en']).to.equal(
                'Carrotgem'
              );
            }
          );
        });
      });
    });
  });
});
