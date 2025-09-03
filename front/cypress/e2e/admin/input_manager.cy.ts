import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

function checkSelectedAssigneeFilter(optionLabelText: string) {
  cy.get('#e2e-select-assignee-filter')
    .find(':selected')
    .should('have.text', optionLabelText);
}

function selectAssigneeFilter(optionLabelText: string) {
  cy.get('#e2e-select-assignee-filter').select(optionLabelText);
}

describe('Input manager', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Assignee filter', () => {
    it('Filters on All ideas', () => {
      cy.visit('/admin/ideas/');
      checkSelectedAssigneeFilter('Any administrator');
      // check that number of ideas on first page is 10
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
    });

    it('Filters on Assigned to me', () => {
      cy.getAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;
        let projectId: string;
        const phaseTitle = randomString();

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: phaseTitle,
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle = randomString();
            const ideaContent = randomString();

            cy.apiCreateIdea({
              projectId,
              ideaTitle,
              ideaContent,
              phaseIds: [phase.body.data.id],
            });

            // do a refresh for the new idea to appear
            cy.visit('/admin/ideas/');
            // click on Assigned to me filter
            const optionLabelText = 'Assigned to me';
            selectAssigneeFilter(optionLabelText);
            checkSelectedAssigneeFilter(optionLabelText);
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
        let projectId: string;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: 'phaseTitle',
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle1 = randomString();
            const ideaTitle2 = randomString();
            const ideaContent1 = randomString();
            const ideaContent2 = randomString();

            // Create one idea with official feedback
            cy.apiCreateIdea({
              projectId,
              ideaTitle: ideaTitle1,
              ideaContent: ideaContent1,
              phaseIds: [phase.body.data.id],
            }).then((idea) => {
              const ideaId = idea.body.data.id;
              const officialFeedbackContent = randomString();
              const officialFeedbackAuthor = randomString();
              cy.apiCreateOfficialFeedbackForIdea(
                ideaId,
                officialFeedbackContent,
                officialFeedbackAuthor
              );

              // Create one idea without official feedback
              cy.apiCreateIdea({
                projectId,
                ideaTitle: ideaTitle2,
                ideaContent: ideaContent2,
              }).then(() => {
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
      checkSelectedAssigneeFilter('Any administrator');
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
    it('Closes when you delete the idea', () => {
      cy.getAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;
        let projectId: string;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: 'phaseTitle',
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle = randomString();
            const ideaContent = randomString();

            cy.apiCreateIdea({
              projectId,
              ideaTitle,
              ideaContent,
              phaseIds: [phase.body.data.id],
            }).then((_idea) => {
              cy.visit('/admin/ideas/');
              // click on title of first idea
              cy.get('.e2e-idea-manager-idea-title')
                .first()
                .click({ force: true })
                .then(() => {
                  // check if the modal popped out and has the idea in it
                  cy.get('#e2e-modal-container').should('exist');
                  // delete the idea
                  cy.get('#e2e-input-manager-side-modal-delete-button').click();
                  // click the browser's confirm button
                  cy.on('window:confirm', () => true);
                  // check if the modal is no longer on the page
                  cy.get('#e2e-modal-container').should('not.exist');
                });
            });
          });
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
    let adminUserId: string;

    before(() => {
      cy.apiCreateAdmin(firstName, lastName, email, password).then(
        (newAdmin) => {
          adminUserId = newAdmin.body.data.id;
          newAdminFirstName = newAdmin.body.data.attributes.first_name;
          newAdminLastName = newAdmin.body.data.attributes.last_name;
          cy.apiConfirmUser(email, password);
        }
      );
      cy.logout();
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveUser(adminUserId);
    });

    it('Assigns a user to an idea', () => {
      cy.visit('/admin/ideas/');
      const optionLabelText1 = 'Unassigned';
      selectAssigneeFilter(optionLabelText1);
      checkSelectedAssigneeFilter(optionLabelText1);
      // Pick first idea in idea table and assign it to our user
      cy.wait(500);
      cy.get('#post-row-select-assignee')
        .first()
        .select(`Assigned to ${newAdminFirstName} ${newAdminLastName}`);
      // Select this user in the assignee filter
      const optionLabelText2 = `Assigned to ${newAdminFirstName} ${newAdminLastName}`;
      selectAssigneeFilter(optionLabelText2);
      checkSelectedAssigneeFilter(optionLabelText2);

      // Check if idea is there
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
    });
  });

  describe('Tag filter', () => {
    it('navigates to the platform-wide tag settings when the user clicks "Edit tags" in the tags tab', () => {
      cy.visit('/admin/ideas/');
      cy.dataCy('e2e-admin-post-manager-filter-sidebar-topics').click();
      cy.dataCy('e2e-post-manager-topic-filters-edit-tags').click();

      cy.location('pathname').should('eq', `/en/admin/settings/topics`);
    });
  });
});
