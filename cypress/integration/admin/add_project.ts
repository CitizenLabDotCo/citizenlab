describe('Admin: add project', () => {

  beforeEach(() => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/projects/');
    // find the add project button on admin/settings/projects and click it
    cy.get('.e2e-admin-add-project').click();
    // go to the project creation form
    cy.location('pathname').should('eq', '/en-GB/admin/projects/new');
  });

  context('Type: Timeline', () => {
    context('Areas: All areas', () => {
      it('creates a draft project', () => {
        const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
        const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

        // Select 'Draft' publication status
        cy.get('.e2e-projecstatus-draft').click();

        // Type random project titles for these required fields
        cy.get('#project-title-en-GB').type(projectTitleEN);
        cy.get('#project-title-nl-BE').type(projectTitleNL);

        // Submit project
        cy.get('.e2e-submit-wrapper-button').click();

        // Navigates to admin/settings/projects
        cy.location('pathname').should('eq', '/en-GB/admin/projects');

        // Wait until new project is added to the list
        cy.wait(1000);

        // Project should appear on top of the Published projects
        cy.get('#e2e-admin-draft-projects-list')
          .find('.e2e-admin-projects-list-item')
          .first()
          .contains(projectTitleEN);
      });

      it('creates a published project', () => {
        const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
        const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

        // Select 'Published' publication status
        cy.get('.e2e-projecstatus-published').click();

        // Type random project titles for these required fields
        cy.get('#project-title-en-GB').type(projectTitleEN);
        cy.get('#project-title-nl-BE').type(projectTitleNL);

        // Submit project
        cy.get('.e2e-submit-wrapper-button').click();

        // Navigates to admin/settings/projects
        cy.location('pathname').should('eq', '/en-GB/admin/projects');

        // Wait until new project is added to the list
        cy.wait(1000);

        // Project should appear on top of the Published projects
        cy.get('#e2e-admin-published-projects-list')
          .find('.e2e-admin-projects-list-item')
          .first()
          .contains(projectTitleEN);
      });

      it('creates an archived project', () => {
        const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
        const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

        // Select 'Archived' publication status
        cy.get('.e2e-projecstatus-archived').click();

        // Type random project titles for these required fields
        cy.get('#project-title-en-GB').type(projectTitleEN);
        cy.get('#project-title-nl-BE').type(projectTitleNL);

        // Submit project
        cy.get('.e2e-submit-wrapper-button').click();

        // Navigates to admin/settings/projects
        cy.location('pathname').should('eq', '/en-GB/admin/projects');

        // Wait until new project is added to the list
        cy.wait(1000);

        // Project should appear on top of the Published projects
        cy.get('#e2e-admin-archived-projects-list')
          .find('.e2e-admin-projects-list-item')
          .first()
          .contains(projectTitleEN);
      });
    });
  });
});
