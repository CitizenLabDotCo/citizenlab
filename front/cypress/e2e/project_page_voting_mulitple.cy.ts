import { randomEmail, randomString } from '../support/commands';
import moment = require('moment');

describe('Multiple voting project', () => {
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let ideaSlug: string;
  let userId: string;
  const projectTitle = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const phaseTitle = randomString();

  before(() => {
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'voting',
          votingMethod: 'multiple_voting',
          votingMaxVotesPerIdea: 2,
          votingMaxTotal: 5,
          canPost: true,
          canComment: true,
          canReact: true,
          allow_anonymous_participation: true,
        });
      })
      .then((phase) => {
        return cy
          .apiCreateIdea({
            projectId,
            ideaTitle,
            ideaContent,
            phaseIds: [phase.body.data.id],
          })
          .then((idea) => {
            ideaId = idea.body.data.id;
            ideaSlug = idea.body.data.attributes.slug;
            cy.apiSignup(firstName, lastName, email, password).then(
              (response) => {
                userId = (response as any).body.data.id;
              }
            );
            cy.setLoginCookie(email, password);
            cy.visit(`/en/projects/${projectSlug}`);
            cy.acceptCookies();
            cy.wait(1000);
          });
      });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
  });

  it('hides the idea sorting options', () => {
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate the votes to ideas and show how many votes are left', () => {
    cy.contains('Cast your vote');
    cy.contains('How to vote');
    cy.contains('5 / 5');

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-button button')
      .should('exist')
      .click();

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-widget')
      .should('exist');

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('not.have.class', 'disabled');

    cy.contains('4 / 5');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .click()
      .should('have.class', 'disabled');
    cy.contains('3 / 5');

    cy.wait(1000);
  });

  it('can submit the votes', () => {
    cy.intercept(`**/baskets/**`).as('basketRequest');
    cy.visit(`/en/projects/${projectSlug}`);
    cy.wait('@basketRequest');
    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('not.have.class', 'disabled');
    cy.wait(1000);
    cy.get('#e2e-voting-submit-button').find('button').click({ force: true });

    cy.contains('Vote submitted');
    cy.contains('Congratulations, your vote has been submitted');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-minus button')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .should('have.class', 'disabled');
  });

  it('can modify and remove your votes', () => {
    cy.get('#e2e-modify-votes')
      .should('exist')
      .should('contain', 'Modify your vote')
      .click();
    cy.wait(1000);

    cy.get('#e2e-ideas-container').find('.e2e-vote-minus button').click();

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .should('not.have.class', 'disabled');

    cy.contains('4 / 5');

    cy.get('#e2e-ideas-container').find('.e2e-vote-minus button').click();

    cy.contains('5 / 5');

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-button button')
      .should('exist');

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('have.class', 'disabled');
  });

  // TODO: Check you cannot add more than the maximum number of votes?
});
