import { randomString } from '../support/commands';

describe('Idea custom field', () => {
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);
  const initialNumberOfBenches = '15';
  const editedNumberOfBenches = '28';

  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.getProjectBySlug('custom-idea-fields-project').then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('exists on the Input form page', () => {
    cy.visit(`admin/projects/${projectId}/ideaform`);

    // Check to see that custom field exists on input form
    cy.get('.e2e-number_of_benches-setting-collapsed').should('exist');
  });

  /* TODO: Change test to verify custom value on idea show page
   * This test navigates to the edit page again to verify that the custom idea field is there.
   * This should be changed once we show the custom idea field in the idea show page.
   */
  it('of type number can be created on an idea and values edited', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-title-input input').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');
    cy.get('#propertiesnumber_of_benches').as('customFieldInput');
    cy.get('.e2e-submit-idea-form').as('submitForm');

    // Check that custom input field exists on the page
    cy.get('@customFieldInput').should('exist');

    // Type test data into the fields
    cy.get('@titleInput').clear().type(ideaTitle);
    cy.get('@descriptionInput').clear().type(ideaContent);
    cy.get('@customFieldInput').type(initialNumberOfBenches);

    // Save the form
    cy.get('@submitForm').click();

    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);

    cy.get('#e2e-idea-more-actions').as('moreActions');
    cy.get('@moreActions').click();

    cy.get('.e2e-more-actions-list button').as('editButton');
    cy.get('@editButton').eq(1).contains('Edit').click();

    // Check that custom field contains the initial value
    cy.get('@customFieldInput').should('contain.value', initialNumberOfBenches);

    // Change custom field
    cy.get('@customFieldInput').type(editedNumberOfBenches);

    // Save the form again
    cy.get('@submitForm').click();

    // Navigate to the edit page
    cy.get('@moreActions').click();
    cy.get('@editButton').eq(1).contains('Edit').click();

    // Check that custom field contains the same edited value
    cy.get('@customFieldInput').should('contain.value', editedNumberOfBenches);
  });

  it('shows an error when the user leaves it empty during idea creation', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-title-input input').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');
    cy.get('#propertiesnumber_of_benches').as('customFieldInput');
    cy.get('.e2e-submit-idea-form').as('submitForm');

    // Check that custom input field exists on the page
    cy.get('@customFieldInput').should('exist');

    // Type test data into the fields
    cy.get('@titleInput').clear().type(ideaTitle);
    cy.get('@descriptionInput').clear().type(ideaContent);
    cy.get('@customFieldInput').clear();

    // Save the form
    cy.get('@submitForm').click();

    cy.get('.e2e-error-message').should(
      'contain.text',
      'This field is required'
    );
  });

  /* TODO: Change test to verify custom value on idea show page
   * This test navigates to the edit page again to verify that the custom idea field is there.
   * This should be changed once we show the custom idea field in the idea show page.
   */
  it('of type string can be created on an idea and values edited', () => {
    const parkName = 'Recreation park';

    cy.visit(`projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-title-input input').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');
    cy.get('#propertiesnumber_of_benches').as('customFieldInput');
    cy.get('#propertiespark_name').as('customStringFieldInput');
    cy.get('.e2e-submit-idea-form').as('submitForm');

    // Check that custom input field exists on the page
    cy.get('@customStringFieldInput').should('exist');

    // Type test data into the fields
    cy.get('@titleInput').clear().type(ideaTitle);
    cy.get('@descriptionInput').clear().type(ideaContent);
    cy.get('@customFieldInput').type(initialNumberOfBenches);
    cy.get('@customStringFieldInput').type(parkName);

    // Save the form
    cy.get('@submitForm').click();

    cy.get('#e2e-idea-more-actions').as('moreActions');
    cy.get('@moreActions').click();

    cy.get('.e2e-more-actions-list button').as('editButton');
    cy.get('@editButton').eq(1).contains('Edit').click();

    // Check that custom field contains the initial value
    cy.get('@customStringFieldInput').should('contain.value', parkName);

    // Change custom field
    cy.get('@customStringFieldInput').clear();

    // Save the form again
    cy.get('@submitForm').click();

    // Navigate to the edit page
    cy.get('@moreActions').click();
    cy.get('@editButton').eq(1).contains('Edit').click();

    // Check that custom field contains the same edited value
    cy.get('@customFieldInput').should('contain.value', '');
  });
});
