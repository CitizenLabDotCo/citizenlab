import { randomEmail, randomString } from '../support/commands';

describe('Continuous Single voting project', () => {
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

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
      participationMethod: 'voting',
      votingMethod: 'single_voting',
      votingMaxTotal: 5,
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy
        .apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          undefined,
          undefined,
          undefined
        )
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
    cy.get('#e2e-continuous-project-idea-cards');
  });

  it('hides the idea sorting options', () => {
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate votes to ideas and show how many votes are left', () => {
    cy.contains('Cast your vote');
    cy.contains('How to vote');
    cy.contains('5 / 5');

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-single-vote-button button')
      .should('have.class', 'primary-outlined')
      .click()
      .should('have.class', 'primary');
    cy.wait(1000);

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('not.have.class', 'disabled');

    cy.contains('4 / 5');
  });

  it('can submit the votes', () => {
    cy.get('#e2e-voting-submit-button').find('button').click();
    cy.wait(1000);

    cy.contains('Vote submitted');
    cy.contains('Congratulations, your vote has been submitted');

    cy.get('#e2e-ideas-container')
      .find('.e2e-single-vote-button button')
      .should('have.class', 'disabled');
  });

  it('can modify and remove the votes', () => {
    cy.get('#e2e-modify-votes')
      .should('exist')
      .should('contain', 'Modify your vote')
      .click();
    cy.wait(1000);

    cy.get('#e2e-ideas-container')
      .find('.e2e-single-vote-button button')
      .should('have.class', 'primary')
      .click()
      .should('have.class', 'primary-outlined');

    cy.get('#e2e-voting-submit-button')
      .should('exist')
      .should('have.class', 'disabled');
  });

  // TODO: Check you cannot add more than the maximum?
});
