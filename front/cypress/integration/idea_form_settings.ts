import { randomString, apiRemoveProject } from '../support/commands';

describe('Idea form settings', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    // create new project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    cy.setAdminLoginCookie();
  });

  describe('Enabled setting', () => {
    describe('Location enabled', () => {
      it('Shows the list/view toggle above the idea cards', () => {
        cy.visit(`projects/${projectTitle}`);
        cy.get('#e2e-ideas-container');
        cy.get('.e2e-list-map-viewbuttons').should('exist');
      });
    });
    describe('Location disabled', () => {
      it("Doesn't show a disabled field in the idea form", () => {
        // check that location field is in the project's idea form initially
        cy.visit(`projects/${projectSlug}/ideas/new`);
        cy.get('.e2e-idea-form-location-input-field').should('exist');

        // go to idea form settings of our newly created project
        cy.visit(`admin/projects/${projectId}/ideaform`);

        // set project idea form setting of location to disabled
        cy.get('.e2e-location-setting-collapsed').click();
        cy.get('.e2e-location-enabled-toggle-label').click();
        cy.get('#e2e-ideaform-settings-submit').click();

        // go to idea form and verify field is not there
        cy.get('#e2e-new-idea').click();
        cy.get('.e2e-idea-form-location-input-field').should('not.exist');
      });

      it("Doesn't show disabled field on idea show page", () => {
        // post idea with location
        const ideaTitle = randomString();
        const ideaContent = randomString();
        const locationGeoJSON = {
          type: 'Point',
          coordinates: [4.351710300000036, 50.8503396],
        };
        const locationDescription = 'Brussel, België';

        cy.apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          locationGeoJSON,
          locationDescription
        ).then(() => {
          cy.visit(`/ideas/${ideaTitle}`);
          cy.get('#e2e-idea-show-page-content');
          cy.wait(1000);
        });

        // check that location is initially on idea show page
        cy.get('#e2e-map-popup').contains('Brussel, België');

        // go to idea form settings of this idea's project
        cy.visit(`admin/projects/${projectId}/ideaform`);
        cy.wait(1000);

        // set location to disabled
        cy.get('.e2e-location-setting-collapsed').click();
        cy.get('.e2e-location-enabled-toggle-label').click();
        cy.get('#e2e-ideaform-settings-submit').click();

        // check that location isn't on the idea show page anymore
        cy.visit(`/ideas/${ideaTitle}`);
        cy.get('#e2e-idea-show-page-content');
        cy.wait(1000);
        cy.get('#e2e-map-popup').should('not.exist');
      });

      it("Doesn't show the list/view toggle above the idea cards", () => {
        // check that the list/view toggle is initially above the idea cards
        cy.visit(`projects/${projectTitle}`);
        cy.get('#e2e-ideas-container');
        cy.get('.e2e-list-map-viewbuttons');

        // go to idea form settings of our newly created project
        cy.visit(`admin/projects/${projectId}/ideaform`);

        // set project idea form setting of location to disabled
        cy.get('.e2e-location-setting-collapsed').click();
        cy.get('.e2e-location-enabled-toggle-label').click();
        cy.get('#e2e-ideaform-settings-submit').click();

        // verify that the list/view toggle buttons are not there anymore
        cy.visit(`projects/${projectTitle}`);
        cy.get('#e2e-ideas-container');
        cy.get('.e2e-list-map-viewbuttons').should('not.exist');
      });
    });
  });

  describe('Required setting', () => {
    describe('Required topics field', () => {
      describe('Existing idea', () => {
        it('Requires field in idea edit form after it became required', () => {
          // post idea without topic
          const ideaTitle = randomString();
          const ideaContent = randomString(30);
          let ideaId: string;

          cy.apiCreateIdea(projectId, ideaTitle, ideaContent).then((idea) => {
            ideaId = idea.body.data.id;
            cy.visit(`/ideas/${ideaTitle}`);
            cy.get('#e2e-idea-show-page-content');
            cy.wait(1000);
            cy.acceptCookies();

            // go to idea form settings of this idea's project
            cy.visit(`admin/projects/${projectId}/ideaform`);
            cy.wait(1000);

            // set topics to required
            cy.get('.e2e-topics-setting-collapsed').click();
            cy.get('.e2e-topics-required-toggle-label').click();
            cy.get('#e2e-ideaform-settings-submit').click();

            // go to ideaform and try to post idea
            cy.visit(`ideas/edit/${ideaId}`);
            // reload so that the new settings are correctly applied
            cy.reload();
            // without getting the form first, the form gets submitted before the fields are loaded
            cy.get('#idea-form');
            cy.get('#e2e-idea-edit-save-button').click();

            // find topics error on idea form page and check we stay on the idea form page
            cy.get('#e2e-new-idea-topics-error');
            cy.location('pathname').should('eq', `/en/ideas/edit/${ideaId}`);
          });
        });
      });

      describe('New idea', () => {
        it('The idea form reports an error when a required field is missing', () => {
          // go to idea form settings of our newly created project
          cy.visit(`admin/projects/${projectId}/ideaform`);

          // set project idea form setting of topics to required
          cy.get('.e2e-topics-setting-collapsed').click();
          cy.get('.e2e-topics-required-toggle-label').click();
          cy.get('#e2e-ideaform-settings-submit').click();

          // go to ideaform and try to post idea
          cy.visit(`projects/${projectSlug}/ideas/new`);
          cy.acceptCookies();

          // try to post an idea without the required topics field
          // without getting the form first, the form gets submitted before the fields are loaded
          cy.get('#idea-form');
          cy.get('#e2e-idea-new-submit-button').click();

          // verify that we got an error for the topics field
          // and check we stay on the idea form page
          cy.get('#e2e-new-idea-topics-error');
          cy.location('pathname').should(
            'eq',
            `/en/projects/${projectSlug}/ideas/new`
          );
        });
      });
    });
  });

  afterEach(() => {
    apiRemoveProject(projectId);
  });
});
