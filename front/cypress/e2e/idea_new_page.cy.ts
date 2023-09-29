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
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-title-input .e2e-error-message');
  });

  it('shows a back button to navigate to the projects page', () => {
    cy.get('#e2e-go-back-link').click();
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
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-description-input .e2e-error-message');
  });

  it('shows an error when the title is less than 10 characters long', () => {
    cy.get('#idea-form');
    cy.get('#e2e-idea-title-input input').type(randomString(9));
    cy.get('.e2e-submit-idea-form').click();
    cy.get('#e2e-idea-title-input .e2e-error-message');
  });

  it('shows an error when the description is less than 30 characters long', () => {
    cy.get('#idea-form');
    cy.get('#e2e-idea-description-input .ql-editor').type(randomString(20));
    cy.get('#e2e-idea-description-input .ql-editor').blur();
    cy.wait(1000);
    cy.get('.e2e-submit-idea-form').click();
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

    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // verify the title and description
    cy.get('#e2e-idea-title-input input').should('contain.value', ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').contains(ideaContent);

    // Check that the geocoder has autofilled the location
    cy.get('.e2e-idea-form-location-input-field input').should(
      'contain.value',
      geocodedLocation
    );
    cy.wait(1000);
    // save the idea
    cy.get('.e2e-submit-idea-form').click();

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
    cy.wait(500);
    cy.get('.e2e-idea-form-location-input-field input').should(
      'contain.value',
      'Belgium'
    );

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // save the form
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(3000);

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
      type: 'timeline',
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
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // save the form
    cy.get('.e2e-submit-idea-form').click();

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
    cy.get('#e2e-idea-show')
      .find('#e2e-map-popup')
      .contains('Boulevard Anspach');
    cy.get('#e2e-idea-show')
      .find('.e2e-author-link .e2e-username')
      .contains(`${firstName} ${lastName}`);
  });
});
