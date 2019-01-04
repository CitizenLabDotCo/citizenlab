import { isString, get } from 'lodash-es';

describe('Admin: add project', () => {

  const getProject = (projectId: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
      url: `web_api/v1/projects/${projectId}`,
    });
  };

  const getArea = (areaId: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
      url: `web_api/v1/areas/${areaId}`,
    });
  };

  beforeEach(() => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.visit('/admin/projects/');
    // find the add project button on admin/settings/projects and click it
    cy.get('.e2e-admin-add-project').click();
    // go to the project creation form
    cy.location('pathname').should('eq', '/en-GB/admin/projects/new');
  });

  context('Type: Timeline', () => {
    // context('Areas: All areas', () => {
    //   it('creates a draft project', () => {
    //     const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
    //     const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

    //     // Select 'Draft' publication status
    //     cy.get('.e2e-projecstatus-draft').click();

    //     // Type random project titles for these required fields
    //     cy.get('#project-title-en-GB').type(projectTitleEN);
    //     cy.get('#project-title-nl-BE').type(projectTitleNL);

    //     // Submit project
    //     cy.get('.e2e-submit-wrapper-button').click();

    //     // Navigates to admin/settings/projects
    //     cy.location('pathname').should('eq', '/en-GB/admin/projects');

    //     // Project should appear on top of the Published projects
    //     cy.get('#e2e-admin-draft-projects-list').contains(projectTitleEN);
    //   });

    //   it('creates a published project', () => {
    //     const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
    //     const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

    //     // Select 'Published' publication status
    //     cy.get('.e2e-projecstatus-published').click();

    //     // Type random project titles for these required fields
    //     cy.get('#project-title-en-GB').type(projectTitleEN);
    //     cy.get('#project-title-nl-BE').type(projectTitleNL);

    //     // Submit project
    //     cy.get('.e2e-submit-wrapper-button').click();

    //     // Navigates to admin/settings/projects
    //     cy.location('pathname').should('eq', '/en-GB/admin/projects');

    //     // Project should appear on top of the Published projects
    //     cy.get('#e2e-admin-published-projects-list').contains(projectTitleEN);
    //   });

    //   it('creates an archived project', () => {
    //     const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
    //     const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

    //     // Select 'Archived' publication status
    //     cy.get('.e2e-projecstatus-archived').click();

    //     // Type random project titles for these required fields
    //     cy.get('#project-title-en-GB').type(projectTitleEN);
    //     cy.get('#project-title-nl-BE').type(projectTitleNL);

    //     // Submit project
    //     cy.get('.e2e-submit-wrapper-button').click();

    //     // Navigates to admin/settings/projects
    //     cy.location('pathname').should('eq', '/en-GB/admin/projects');

    //     // Project should appear on top of the Published projects
    //     cy.get('#e2e-admin-archived-projects-list').contains(projectTitleEN);
    //   });
    // });

    context('Areas: Selection', () => {
      it('creates a published project with the correct area', () => {
        const projectTitleEN = Math.random().toString(36).substr(2, 5).toLowerCase();
        const projectTitleNL = Math.random().toString(36).substr(2, 5).toLowerCase();

        // Select 'Published' publication status
        cy.get('.e2e-projecstatus-published').click();

        // Type random project titles for these required fields
        cy.get('#project-title-en-GB').type(projectTitleEN);
        cy.get('#project-title-nl-BE').type(projectTitleNL);

        // Select 'Selection' as Areas option
        cy.get('.e2e-areas-selection').click();

        // Pick (only) area
        cy.get('#e2e-area-selector').click().trigger('keydown', { keyCode: 13, which: 13 });

        // Submit project
        cy.get('.e2e-submit-wrapper-button').click();

        // Navigates to admin/settings/projects
        cy.location('pathname').should('eq', '/en-GB/admin/projects');

        // Get projectId, then areaId and look up area to compare
        let projectId;
        cy.get(`.e2e-admin-edit-project.${projectTitleEN}`)
          .find('a')
          .then((manageProjectButtonLinks) => {
            const manageProjectButtonLink = manageProjectButtonLinks[0];
            const href = manageProjectButtonLink.href;
            const hrefSegments = href && href.split('/');
            projectId = Array.isArray(hrefSegments) && hrefSegments[hrefSegments.length - 2];

            if (isString(projectId)) {
              getProject(projectId).then((projectData) => {
                const areaId = get(projectData.body.data.relationships.areas.data[0], 'id');
                if (isString(areaId)) {
                  getArea(areaId).then((areaData) => {
                    const area = get(areaData.body.data.attributes.title_multiloc, 'en-GB');
                    expect(area).to.eq('Carrotgem');
                  });
                }
              });
            }
          });
      });
    });
  });
});
