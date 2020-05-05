import { randomString, apiRemoveProject } from '../support/commands';

describe('Idea form settings', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;
  let projectSlug: string;

  before(() => {
    // create new project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published'
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    cy.setAdminLoginCookie();
  });

  // beforeEach(() => {

  //   cy.visit(`/projects/${projectSlug}`);
  //   cy.wait(1000);
  // });

  describe('Enabled setting', () => {
    describe('Location disabled', () => {
      it('Doesn\'t show a disabled field in the idea form', () => {
        // check that location field is in the project's idea form initially
        cy.visit(`projects/${projectSlug}/ideas/new`);
        cy.get('.e2e-idea-form-location-input-field').should('exist');

        // go to idea form settings of our newly created idea
        cy.visit(`admin/projects/${projectId}/ideaform`);

        // set project idea form setting of location to disabled
        cy.get('.e2e-location-setting-collapsed').click();
        cy.get('.e2e-location-enabled-toggle-label').click();
        cy.get('#e2e-ideaform-settings-submit').click();

        // go to idea form and verify field is not there
        cy.get('#e2e-new-idea').click();
        cy.get('.e2e-idea-form-location-input-field').should('not.exist');
      });

      it('Doesn\'t show disabled field on idea show page', () => {
        // post idea with location

        // check idea show page and verify location (map) isn't there

      });
     });
  });

  describe('Required setting', () => {

    describe('Optional topics field', () => {
      it('An idea can be posted without filling out the optional field', () => {
        // set topics field to be optional

        // post an idea without the optional topics field

        // verify that the idea posting succeeds and we're on the idea show page

      });
    });

    describe('Required topics field', () => {
      describe('Existing idea', () => {
        it('Requires field in idea edit form after it became required', () => {
          // post idea without topic

          // make topic required

          // verify that we got an error for the topics field

        });
      });

      describe('New idea', () => {

        it('The idea form reports an error when a required field is missing', () => {
          // set topics field to be required

          // post an idea without the required topics field

          // verify that we got an error for the topics field

        });
      });

    });

  });

  after(() => {
    apiRemoveProject(projectId);
  });
});
