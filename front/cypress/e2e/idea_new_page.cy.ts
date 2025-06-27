import { randomString, randomEmail } from '../support/commands';

const round = (x: number) => Math.round(x * 1000) / 1000;

describe('Idea submission form', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas/new');
    cy.get('#idea-form');
    cy.acceptCookies();
  });

  it('shows an error when no title is provided', () => {
    const value = randomString(9);
    cy.get('#idea-form');
    cy.wait(1000);
    // Try to go to the next page
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('.e2e-error-message').should('exist');
  });

  it('shows a back button to navigate to the projects page', () => {
    const ideaTitle = randomString(9);
    cy.get('#title_multiloc').type(ideaTitle);
    cy.get('#title_multiloc').should('contain.value', ideaTitle);
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.dataCy('e2e-leave-new-idea-button').click();
    cy.dataCy('e2e-confirm-leave-new-idea-button').should('exist');
    cy.dataCy('e2e-confirm-leave-new-idea-button').click();
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council'
    );
    cy.wait(2000);
    cy.contains(ideaTitle).should('not.exist');
  });

  it('shows an error when no title is provided', () => {
    // Try to go to the next page
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('.e2e-error-message');
  });

  it('shows an error when no description is provided', () => {
    const ideaTitle = randomString(9);
    cy.get('#title_multiloc').click().type(ideaTitle, { delay: 0 });
    cy.get('#title_multiloc').should('contain.value', ideaTitle);

    // Go to the description page
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Try to go to the next page
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('.e2e-error-message');
  });

  it('shows an error when the title is less than 3 characters long', () => {
    cy.get('#title_multiloc').type(randomString(2), { delay: 0 });
    // Try to go to the next page
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('.e2e-error-message');
  });

  it('shows no error when the description is less than 3 characters long', () => {
    const ideaTitle = randomString(10);
    cy.get('#title_multiloc').type(ideaTitle, { delay: 0 });
    cy.get('#title_multiloc').should('contain.value', ideaTitle);

    const ideaContent = randomString(2);
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('#body_multiloc .ql-editor').type(ideaContent, {
      delay: 0,
    });
    cy.get('#body_multiloc .ql-editor').contains(ideaContent);
    cy.wait(100);

    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-submit-form').click();
    cy.dataCy('e2e-after-submission').should('exist').click();
    cy.contains(ideaTitle).should('exist');
  });

  it('saves correct location point when provided in URL', () => {
    cy.intercept('POST', '**/ideas').as('submitIdea');

    const ideaTitle = randomString(40);
    const ideaContent = randomString(60);
    const geocodedLocation = 'Korenmarkt 11, 9000 Gent, Belgium';
    const lat = 51.0546195;
    const long = 3.7219968;

    // Go to URL with lat/long where point is in body of water
    cy.visit(
      `/projects/an-idea-bring-it-to-your-council/ideas/new?lat=${lat}&lng=${long}`
    );
    cy.get('#idea-form');
    // So typing the title doesn't get interrupted
    cy.wait(1000);
    cy.contains('Add new idea').should('exist');

    // Add a title
    cy.get('#title_multiloc').click().type(ideaTitle, { delay: 0 });
    cy.get('#title_multiloc').should('contain.value', ideaTitle);

    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Add a description
    cy.get('#body_multiloc .ql-editor').type(ideaContent);
    cy.get('#body_multiloc .ql-editor').contains(ideaContent);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Check that the geocoder has autofilled the location
    cy.get('.e2e-idea-form-location-input-field').contains(geocodedLocation);
    // save the idea
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    // Intercept the payload, and make sure the original lat/long values are saved as the point
    cy.wait('@submitIdea').then((interception) => {
      const value = interception.request.body.idea['location_point_geojson'];
      expect(round(value.coordinates[0])).to.equal(round(long));
      expect(round(value.coordinates[1])).to.equal(round(lat));
    });
  });

  it('has a working idea form', () => {
    const ideaTitle = randomString(40);
    const ideaContent = randomString(60);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');
    // add a title and description
    cy.get('#title_multiloc').type(ideaTitle);
    cy.get('#title_multiloc').should('contain.value', ideaTitle);

    // is accessible
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });

    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('#body_multiloc .ql-editor').type(ideaContent);
    cy.get('#body_multiloc .ql-editor').contains(ideaContent);

    cy.wait(1000);
    cy.checkA11y(undefined, { includedImpacts: ['critical'] });
    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('[data-cy="e2e-idea-file-upload"]');
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });
    // Go to the page with topics
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });
    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field').type(
      'Boulevard Anspach Brussels'
    );
    cy.wait(7000);
    cy.get('.e2e-idea-form-location-input-field input')
      .first()
      .focus()
      .type('{enter}');
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });
    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });

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
    cy.get('#e2e-idea-show')
      .find('.e2e-author-link .e2e-username')
      .contains(`${firstName} ${lastName}`);
    cy.checkA11y(undefined, { includedImpacts: ['serious', 'critical'] });
  });
});
