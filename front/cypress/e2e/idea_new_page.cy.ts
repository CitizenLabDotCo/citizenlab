import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

const round = (x: number) => Math.round(x * 1000) / 1000;

describe('Idea new page for continuous project', () => {
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

  it.skip('shows an error when no title is provided', () => {
    const value = randomString(9);
    cy.get('#idea-form');
    cy.get('#e2e-idea-description-input .ql-editor').type(value);
    cy.get('#e2e-idea-description-input .ql-editor').contains(value);
    cy.wait(1000);
    // Try to go to the next page
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('#e2e-idea-title-input .e2e-error-message');
  });

  it('shows a back button to navigate to the projects page', () => {
    cy.get('[data-cy="e2e-leave-new-idea-button"]').click();
    cy.get('[data-cy="e2e-confirm-leave-new-idea-button"]').should('exist');
    cy.get('[data-cy="e2e-confirm-leave-new-idea-button"]').click();
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council'
    );
  });

  it.skip('shows an error when no description is provided', () => {
    const value = randomString(9);
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input input').type(value);
    cy.get('#e2e-idea-title-input input').should('contain.value', value);
    cy.wait(1000);
    // Try to go to the next page
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('#e2e-idea-description-input .e2e-error-message');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input input').type(randomString(9));
    // Try to go to the next page
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('#e2e-idea-title-input .e2e-error-message');
  });

  it('shows an error when the description is less than 30 characters long', () => {
    const title = randomString(12);
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input input').type(title);
    cy.get('#e2e-idea-title-input input').should('contain.value', title);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(randomString(20));
    cy.get('#e2e-idea-description-input .ql-editor').blur();
    cy.wait(1000);
    // Try to go to the next page
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('#e2e-idea-description-input .e2e-error-message');
  });

  it.skip('saves correct location point when provided in URL', () => {
    cy.intercept('POST', '**/ideas').as('submitIdea');

    const ideaTitle = randomString(40);
    const ideaContent = randomString(60);
    const geocodedLocation = 'Maria-Louizasquare 47, 1000 Brussel, Belgium';
    const lat = 50.84682103382404;
    const long = 4.378963708877564;

    // Go to URL with lat/long where point is in body of water
    cy.visit(
      `/projects/an-idea-bring-it-to-your-council/ideas/new?lat=${lat}&lng=${long}`
    );
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // Add a title
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Add a description
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Check that the geocoder has autofilled the location
    cy.get('.e2e-idea-form-location-input-field [class^=singleValue]').should(
      'contain.value',
      geocodedLocation
    );
    cy.wait(1000);
    // save the idea
    cy.get('[data-cy="e2e-submit-form"]').click();
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
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // Go to the page with topics
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels'
    );
    cy.wait(7000);
    cy.get('.e2e-idea-form-location-input-field input').type('{enter}');

    // save the form
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait(3000);

    cy.get('[data-cy="e2e-after-submission"]').should('exist');
    cy.get('[data-cy="e2e-after-submission"]').click();

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
  });
});

describe('Idea new page for timeline project', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  const phasePastTitle = randomString();

  let projectId: string;
  let projectSlug: string;

  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);

    // create new project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      // create active ideation phase
      cy.apiCreatePhase({
        projectId,
        title: phasePastTitle,
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
        description: `description ${phasePastTitle}`,
      });
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.get('#idea-form');
    cy.acceptCookies();
  });

  it('has a working idea form', () => {
    const ideaTitle = randomString(40);
    const ideaContent = randomString(60);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // Add a title
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // Add a description
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // Go to the page with topics
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels'
    );
    cy.wait(7000);
    cy.get('.e2e-idea-form-location-input-field input').type('{enter}');

    // save the form
    cy.get('[data-cy="e2e-submit-form"]').click();
    cy.wait(3000);

    cy.get('[data-cy="e2e-after-submission"]').should('exist');
    cy.get('[data-cy="e2e-after-submission"]').click();

    // verify the content of the newly created idea page
    cy.get('#e2e-idea-show');
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
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
  });
});
