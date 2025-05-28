import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Follow idea', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle1 = randomString(40);
  const ideaContent1 = randomString(60);
  const ideaTitle2 = randomString(40);
  const ideaContent2 = randomString(60);
  const projectTitle = randomString();
  const phaseTitle = randomString();
  let userId: string;
  let ideaId1: string;
  let ideaSlug1: string;
  let ideaId2: string;
  let ideaSlug2: string;
  let projectId: string;
  let projectSlug: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateProject({
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
          allow_anonymous_participation: true,
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle1,
          ideaContent: ideaContent1,
          phaseIds: [phase.body.data.id],
        }).then((idea) => {
          ideaId1 = idea.body.data.id;
          ideaSlug1 = idea.body.data.attributes.slug;
        });

        cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle2,
          ideaContent: ideaContent2,
          phaseIds: [phase.body.data.id],
        }).then((idea) => {
          ideaId2 = idea.body.data.id;
          ideaSlug2 = idea.body.data.attributes.slug;
        });
      });

    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
    if (ideaId1) {
      cy.apiRemoveIdea(ideaId1);
    }
    if (ideaId2) {
      cy.apiRemoveIdea(ideaId2);
    }
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('automatically follows a user after creating an idea and allows user to unfollow it', () => {
    cy.setAdminLoginCookie();

    cy.visit(`/ideas/${ideaSlug1}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-title').contains(ideaTitle1);

    // Shows an unfollow button because the user follows the idea automatically since they created it
    cy.dataCy('e2e-unfollow-button').should('exist');
    cy.dataCy('e2e-follow-button').should('not.exist');

    // unfollow
    cy.dataCy('e2e-unfollow-button').click();

    cy.dataCy('e2e-unfollow-button').should('not.exist');
    cy.dataCy('e2e-follow-button').should('exist');
  });

  it('shows a follow option and an unfollow option after following', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/ideas/${ideaSlug2}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-title').contains(ideaTitle2);

    // Follow
    cy.dataCy('e2e-follow-button').should('exist');
    cy.dataCy('e2e-follow-button').click();

    // Check that it shows unfollow after
    cy.dataCy('e2e-unfollow-button').should('exist');
    cy.dataCy('e2e-follow-button').should('not.exist');
  });

  it('uses a light login flow when a user is not looged in and follows after', () => {
    cy.visit(`/ideas/${ideaSlug1}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-title').contains(ideaTitle1);

    // Follow
    cy.dataCy('e2e-follow-button').should('exist');
    cy.dataCy('e2e-follow-button').click();

    cy.get('input#email').focus().type(randomEmail());
    cy.get('#e2e-light-flow-email-submit').click();

    cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
    cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
    cy.get('#e2e-policies-continue').click();

    cy.get('input#code').focus().type('1234');
    cy.get('#e2e-verify-email-button').click();

    cy.get('#e2e-success-continue-button').click();

    // Check that it shows unfollow after logging in
    cy.dataCy('e2e-unfollow-button').should('exist');
    cy.dataCy('e2e-follow-button').should('not.exist');
  });
});
