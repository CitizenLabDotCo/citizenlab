import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Project proposal new page', () => {
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
      // create active proposals phase
      cy.apiCreatePhase({
        projectId,
        title: phasePastTitle,
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'proposals',
        canComment: true,
        canPost: true,
        canReact: true,
        description: `description ${phasePastTitle}`,
      });
    });
  });

  it('has a working form', () => {
    cy.intercept('GET', `**/${projectSlug}`).as('getProject');

    const proposalTitle = randomString(40);
    const proposalContent = randomString(60);

    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.wait(2000);

    cy.wait('@getProject');

    cy.acceptCookies();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist'); // Change to proposal later
    // Add a title
    cy.get('#e2e-idea-title-input input')
      .click()
      .type(proposalTitle, { delay: 0 });
    cy.get('#e2e-idea-title-input input').should(
      'contain.value',
      proposalTitle
    );

    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Add a description
    cy.get('#e2e-idea-description-input .ql-editor').type(proposalContent);
    cy.get('#e2e-idea-description-input .ql-editor').contains(proposalContent);

    // Go to the next page of the form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // Go to the next page of the form
    cy.dataCy('e2e-next-page').should('be.visible').click();

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
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // verify the content of the newly created idea page
    cy.get('#e2e-idea-show');
    cy.location('pathname').should('eq', `/en/ideas/${proposalTitle}`);
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(proposalTitle);
    cy.get('#e2e-idea-show')
      .find('#e2e-idea-description')
      .contains(proposalContent);
    cy.get('#e2e-idea-show')
      .find('#e2e-idea-topics')
      .find('.e2e-idea-topic')
      .should('have.length', 1);
    cy.get('#e2e-idea-show').contains('Boulevard Anspach');
    cy.get('#e2e-idea-show')
      .find('.e2e-author-link .e2e-username')
      .contains(`${firstName} ${lastName}`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
