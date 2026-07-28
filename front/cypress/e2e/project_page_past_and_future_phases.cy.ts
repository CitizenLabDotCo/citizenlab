import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Timeline project with past and future phases', () => {
  const pastPollQuestionTitle = randomString();
  const currentPollQuestionTitle = randomString();
  const causeTitle = randomString();
  const email = randomEmail();
  const password = randomString();
  const createdUserIds: string[] = [];
  let projectId = '';
  let projectSlug = '';

  const dateFormat = 'DD/MM/YYYY';

  before(() => {
    cy.apiSignup(randomString(), randomString(), email, password).then(
      (response) => {
        createdUserIds.push(response.body.data.id);
      }
    );

    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      // Past poll phase
      cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: moment().subtract(60, 'days').format(dateFormat),
        endAt: moment().subtract(31, 'days').format(dateFormat),
        participationMethod: 'poll',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiAddPoll(
          phase.body.data.id,
          [{ title: pastPollQuestionTitle, type: 'single_option' }],
          [['Yes', 'No']]
        );
      });

      // Current poll phase
      cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: moment().subtract(30, 'days').format(dateFormat),
        endAt: moment().add(30, 'days').format(dateFormat),
        participationMethod: 'poll',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiAddPoll(
          phase.body.data.id,
          [{ title: currentPollQuestionTitle, type: 'single_option' }],
          [['Yes', 'No']]
        );
      });

      // Future volunteering phase
      cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: moment().add(31, 'days').format(dateFormat),
        endAt: moment().add(60, 'days').format(dateFormat),
        participationMethod: 'volunteering',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateCause(phase.body.data.id, causeTitle);
      });
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    createdUserIds.forEach((id) => {
      cy.apiRemoveUser(id);
    });
  });

  it('lets you take the poll of the current phase', () => {
    // A fresh user per attempt, so retries never hit the already-responded state
    const throwawayEmail = randomEmail();
    const throwawayPassword = randomString();
    cy.apiSignup(
      randomString(),
      randomString(),
      throwawayEmail,
      throwawayPassword
    ).then((response) => {
      createdUserIds.push(response.body.data.id);
    });
    cy.setLoginCookie(throwawayEmail, throwawayPassword);

    cy.visit(`/en/projects/${projectSlug}/2`);

    cy.contains(currentPollQuestionTitle);
    cy.contains(pastPollQuestionTitle).should('not.exist');
    cy.contains('can only be taken when this phase is active').should(
      'not.exist'
    );

    cy.get('.e2e-poll-option').first().should('have.class', 'enabled');
    cy.get('.e2e-poll-option').first().click();
    cy.get('.e2e-send-poll').click();
    cy.get('.e2e-form-completed');
  });

  it('does not let you take the poll of a past phase', () => {
    cy.visit(`/en/projects/${projectSlug}/1`);

    // The poll is still visible, but cannot be taken
    cy.contains(pastPollQuestionTitle);
    cy.contains(currentPollQuestionTitle).should('not.exist');
    cy.contains('can only be taken when this phase is active');
    cy.get('.e2e-poll-option').first().should('have.class', 'disabled');

    // The CTA bar refers to the current phase and navigates back to it
    cy.get('#e2e-participation-cta-poll').click();
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);
    cy.contains(currentPollQuestionTitle);
  });

  it('does not let you volunteer for a cause of a future phase', () => {
    cy.visit(`/en/projects/${projectSlug}/3`);

    // The cause is still visible, but volunteering is not possible
    cy.contains(causeTitle);
    cy.get('#volunteering')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
  });
});
