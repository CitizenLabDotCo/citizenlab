import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Input form builder', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  let questionTitle = randomString();
  const answer = randomString();
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('has a working idea form with all the defaults', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();

    // Verify no warning is shown when there are no submissions
    cy.get('#e2e-warning-notice').should('not.exist');

    // Save the form
    cy.get('form').submit();

    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');
    // add a title and description
    cy.get('#e2e-idea-title-input ').click().type(ideaTitle, { delay: 0 });

    // verify the title and description
    cy.get('#e2e-idea-title-input ').should('contain.value', ideaTitle);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Add a description
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent, {
      force: true,
    });
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.wait(1000);

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload').should('exist');
    cy.get('[data-cy="e2e-idea-file-upload"]').should('exist');

    // Tags are on page three
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    cy.intercept(
      `**/location/autocomplete?input=Boulevard%20Anspach%20Brussels&language=en`
    ).as('locationSearch');

    // add a location
    cy.get('.e2e-idea-form-location-input-field input')
      .first()
      .type('Boulevard Anspach Brussels');
    cy.wait('@locationSearch', { timeout: 10000 });

    cy.get('.e2e-idea-form-location-input-field input')
      .first()
      .type('{downArrow}');
    cy.get('.e2e-idea-form-location-input-field input').first().type('{enter}');

    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(ideaTitle);
    cy.get('#e2e-idea-show')
      .find('#e2e-idea-description')
      .contains(ideaContent);
    cy.get('#e2e-idea-show')
      .find('#e2e-idea-topics')
      .find('.e2e-idea-topic')
      .should('have.length', 1);
    cy.get('#e2e-idea-show').contains('Boulevard Anspach');

    // Verify warning for altering the form is present in form builder
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();
    cy.get('#e2e-warning-notice').should('exist');
  });

  it('can create input form with custom field, save form and user can respond to the form created', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();
    cy.dataCy('e2e-short-answer').should('exist');
    cy.dataCy('e2e-short-answer').click();

    // Save the form
    cy.get('form').submit();

    // Should show error if no title is entered
    cy.get('[data-testid="error-message"]').should('exist');

    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    // Set the field to required
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    cy.get('form').submit();
    // Should show success message on saving
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Fill in the form
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    cy.get('#e2e-idea-title-input ').click().type(ideaTitle, { delay: 0 });
    cy.get('#e2e-idea-title-input ').should('contain.value', ideaTitle);
    cy.wait(500);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);
    cy.wait(500);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload').should('exist');
    cy.get('[data-cy="e2e-idea-file-upload"]').should('exist');
    cy.wait(500);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.intercept(
      `**/location/autocomplete?input=Boulevard%20Anspach%20Brussels&language=en`
    ).as('locationSearch');

    // add a location
    cy.get('.e2e-idea-form-location-input-field input')
      .first()
      .type('Boulevard Anspach Brussels');

    cy.wait('@locationSearch', { timeout: 10000 });

    cy.get('.e2e-idea-form-location-input-field input')
      .first()
      .type('{downArrow}{enter}');

    // Cannot proceed to the next page without filling in the required custom field
    cy.dataCy('e2e-submit-form').click();
    // Verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message');
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/en/projects/${projectSlug}/ideas/new`
    );

    // Fill in required custom field
    cy.contains(questionTitle).should('exist');
    cy.get(`*[id^="properties${questionTitle}"]`).type(answer, { force: true });

    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    // Close with the cross button
    cy.dataCy('e2e-leave-new-idea-button').should('exist').click();

    // The new idea appears on the project page
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);
    cy.contains(ideaTitle).should('exist').click();
    cy.wait(1000);

    // Verify that the answer is not shown on the idea page
    cy.contains(questionTitle).should('not.exist');
  });
});
