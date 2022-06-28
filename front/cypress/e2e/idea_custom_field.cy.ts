import { randomString } from '../support/commands';

describe('Idea custom field', () => {
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);
  const initialNumberOfBenches = '15';
  const editedNumberOfBenches = '28';

  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    cy.getProjectBySlug('custom-idea-fields-project').then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    cy.setAdminLoginCookie();
  });

  it('exists on the Input form page', () => {
    cy.visit(`admin/projects/${projectId}/ideaform`);
    cy.acceptCookies();

    // Check to see that custom field exists on input form
    cy.get('.e2e-number_of_benches-setting-collapsed').should('exist');
  });

  /* TODO: Change test to verify custom value on idea show page
   * This test navigates to the edit page again to verify that the custom idea field is there.
   * This should be changed once we show the custom idea field in the idea show page.
   */
  it('can be created on an idea and values edited', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);
    cy.acceptCookies();

    cy.get('#e2e-idea-title-input input').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');
    cy.get('#propertiescustom_field_valuespropertiesnumber_of_benches').as(
      'customFieldInput'
    );
    cy.get('.e2e-submit-idea-form').as('submitForm');

    // Check that custom input field exists on the page
    cy.get('@customFieldInput').should('exist');

    // Type test data into the fields
    cy.get('@titleInput').clear().type(ideaTitle);
    cy.get('@descriptionInput').clear().type(ideaContent);
    cy.get('@customFieldInput').type(initialNumberOfBenches);

    // Save the form
    cy.get('@submitForm').click();
    cy.wait(500);

    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);

    cy.get('#e2e-idea-more-actions').as('moreActions');
    cy.get('@moreActions').click();

    cy.get('.e2e-more-actions-list button').as('editButton');
    cy.get('@editButton').eq(1).contains('Edit').click();
    cy.wait(500);

    // Check that custom field contains the initial value
    cy.get('@customFieldInput').should('contain.value', initialNumberOfBenches);

    // Change custom field
    cy.get('@customFieldInput').type(editedNumberOfBenches);

    // Save the form again
    cy.get('@submitForm').click();
    cy.wait(500);

    // Navigate to the edit page
    cy.get('@moreActions').click();
    cy.get('@editButton').eq(1).contains('Edit').click();
    cy.wait(500);

    // Check that custom field contains the same edited value
    cy.get('@customFieldInput').should('contain.value', editedNumberOfBenches);
  });
});
