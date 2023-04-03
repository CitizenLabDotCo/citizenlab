import { randomString } from '../../support/commands';

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

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  it('has a working idea form with all the defaults', () => {
    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();

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
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // verify the title and description
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels{enter}'
    );
    cy.get(
      '.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div'
    )
      .first()
      .click();

    cy.get('.e2e-idea-form-location-input-field input').should(
      'contain.value',
      'Belgium'
    );

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload').should('exist');
    cy.get('#e2e-idea-file-upload').should('exist');

    // save the form
    cy.get('.e2e-submit-idea-form').click();

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
    cy.get('#e2e-idea-show')
      .find('#e2e-map-popup')
      .contains('Boulevard Anspach');

    // Verify warning for altering the form is present in form builder
    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();
    cy.get('#e2e-warning-notice').should('exist');
  });

  it('can create input form with custom field, save form and user can respond to the form created', () => {
    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();
    cy.get('[data-cy="e2e-short-answer"]').should('exist');
    cy.get('[data-cy="e2e-short-answer"]').click();

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
    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // verify the title and description
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels{enter}'
    );
    cy.get(
      '.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div'
    )
      .first()
      .click();
    cy.wait(500);
    cy.get('.e2e-idea-form-location-input-field input').should(
      'contain.value',
      'Belgium'
    );

    // Fill in required custom field
    cy.contains(questionTitle).should('exist');
    cy.get(`#properties${questionTitle}`).type(answer, { force: true });

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload').should('exist');
    cy.get('#e2e-idea-file-upload').should('exist');

    // save the form
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(3000);

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);

    // Verify that the answer is not shown on the idea page
    cy.contains(questionTitle).should('not.exist');
  });
});
