import { randomString, randomEmail } from '../../support/commands';

describe('Idea manager', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Assignee filter', () => {
    it('Filters on All ideas', () => {
      cy.visit('/admin/ideas/');

      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on All ideas filter
      cy.get('#e2e-assignee-filter-all-posts').click();
      // check that number of ideas on first page is 10
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
    });

    it('Filters on Assigned to me', () => {
      cy.getAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          participationMethod: 'ideation',
          assigneeId: userId,
        }).then((project) => {
          const projectId = project.body.data.id;
          const ideaTitle = randomString();
          const ideaContent = randomString();

          cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

          // do a refresh for the new idea to appear
          cy.visit('/admin/ideas/');
          // grab and open assignee filter menu
          cy.get('#e2e-select-assignee-filter').click();
          // click on Assigned to me filter
          cy.get('#e2e-assignee-filter-assigned-to-user').click();
          // Check whether the newly created idea is assigned to the user
          cy.get('.e2e-idea-manager-idea-row').contains(ideaTitle);
        });
      });
    });
  });

  describe('Need feedback toggle', () => {
    it('Filters on ideas that need feedback', () => {
      cy.getAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          participationMethod: 'ideation',
          assigneeId: userId,
        }).then((project) => {
          const projectId = project.body.data.id;
          const ideaTitle1 = randomString();
          const ideaTitle2 = randomString();
          const ideaContent1 = randomString();
          const ideaContent2 = randomString();

          // Create one idea with official feedback
          cy.apiCreateIdea(projectId, ideaTitle1, ideaContent1).then((idea) => {
            const ideaId = idea.body.data.id;
            const officialFeedbackContent = randomString();
            const officialFeedbackAuthor = randomString();
            cy.apiCreateOfficialFeedbackForIdea(
              ideaId,
              officialFeedbackContent,
              officialFeedbackAuthor
            );

            // Create one idea without official feedback
            cy.apiCreateIdea(projectId, ideaTitle2, ideaContent2).then(() => {
              cy.wait(500);
              cy.visit('/admin/ideas/');

              // Select the newly create project as a filter and check if it just shows our two created ideas
              cy.get('.e2e-idea-manager-project-filter-item')
                .contains(projectTitle)
                .click();
              cy.get('.e2e-idea-manager-idea-row').should('have.length', 2);

              // Turn the 'need feedback' toggle on and check whether it only shows the idea without official feedback
              cy.get('#e2e-feedback_needed_filter_toggle').click();
              cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
            });
            cy.wait(500);
          });
        });
      });
    });
  });

  describe('Idea preview ', () => {
    it('Opens when you click an idea title, then closes with X button', () => {
      cy.visit('/admin/ideas/');
      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on All ideas filter
      cy.get('#e2e-assignee-filter-all-posts').click();
      // click on title of first idea
      cy.get('.e2e-idea-manager-idea-title')
        .first()
        .click()
        .then((ideaTitle) => {
          // check if the modal popped out and has the idea in it
          cy.get('#e2e-modal-container')
            .find('#e2e-idea-title')
            .contains(ideaTitle.text());
          // close modal
          cy.get('.e2e-modal-close-button').click();
          // check if the modal is no longer on the page
          cy.get('#e2e-modal-container').should('have.length', 0);
        });
    });
  });

  describe('Assignee select', () => {
    const firstName = randomString(5);
    const lastName = randomString(5);
    const email = randomEmail();
    const password = randomString();
    let newAdminFirstName: string;
    let newAdminLastName: string;

    before(() => {
      cy.apiCreateAdmin(firstName, lastName, email, password).then(
        (newAdmin) => {
          newAdminFirstName = newAdmin.body.data.attributes.first_name;
          newAdminLastName = newAdmin.body.data.attributes.last_name;
          cy.apiConfirmUser(email, password);
        }
      );
      cy.logout();
      cy.setAdminLoginCookie();
    });

    it('Assigns a user to an idea', () => {
      cy.visit('/admin/ideas/');

      // Select unassigned in assignee filter
      cy.get('#e2e-select-assignee-filter').click();
      cy.get('#e2e-assignee-filter-unassigned').click();
      // Pick first idea in idea table and assign it to our user
      cy.wait(500);
      cy.get('.e2e-idea-manager-idea-row')
        .first()
        .find('.e2e-post-manager-post-row-assignee-select')
        .scrollIntoView({ offset: { top: 100, left: 0 } })
        .click()
        .contains(`${newAdminFirstName} ${newAdminLastName}`)
        .click({ force: true });
      // Select this user in the assignee filter
      cy.get('#e2e-select-assignee-filter')
        .click()
        .find('.e2e-assignee-filter-other-user')
        .contains(`Assigned to ${newAdminFirstName} ${newAdminLastName}`)
        .click({ force: true });
      // Check if idea is there
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
    });
  });
});
