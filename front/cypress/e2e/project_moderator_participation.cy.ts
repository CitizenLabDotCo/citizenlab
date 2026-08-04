import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Poll for admins and collaborators only', () => {
  const pollQuestionTitle = randomString();
  const residentEmail = randomEmail();
  const residentPassword = randomString();
  const createdUserIds: string[] = [];
  let projectId = '';
  let projectSlug = '';

  const dateFormat = 'DD/MM/YYYY';

  before(() => {
    cy.apiSignup(
      randomString(),
      randomString(),
      residentEmail,
      residentPassword
    ).then((response) => {
      createdUserIds.push(response.body.data.id);
    });

    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

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
        const phaseId = phase.body.data.id;

        cy.apiAddPoll(
          phaseId,
          [{ title: pollQuestionTitle, type: 'single_option' }],
          [['Yes', 'No']]
        );

        cy.apiSetPhasePermission({
          phaseId,
          action: 'taking_poll',
          permissionBody: {
            permission: {
              permitted_by: 'admins_moderators',
            },
          },
        });
      });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    createdUserIds.forEach((id) => {
      cy.apiRemoveUser(id);
    });
  });

  it('does not let a resident take the poll', () => {
    cy.setLoginCookie(residentEmail, residentPassword);
    cy.visit(`/en/projects/${projectSlug}`);

    cy.contains(pollQuestionTitle);
    cy.contains('This poll is not currently enabled');
    cy.get('.e2e-poll-option').first().should('have.class', 'disabled');
  });

  it('lets a project moderator take the poll', () => {
    // A fresh moderator per attempt, so retries never hit the already-responded state
    const moderatorEmail = randomEmail();
    const moderatorPassword = randomString();
    cy.apiCreateModeratorForProject({
      firstName: randomString(),
      lastName: randomString(),
      email: moderatorEmail,
      password: moderatorPassword,
      projectId,
    }).then((response) => {
      createdUserIds.push(response.body.data.id);
    });
    cy.setLoginCookie(moderatorEmail, moderatorPassword);

    cy.visit(`/en/projects/${projectSlug}`);

    cy.contains(pollQuestionTitle);
    cy.contains('This poll is not currently enabled').should('not.exist');
    cy.get('.e2e-poll-option').first().should('have.class', 'enabled');
    cy.get('.e2e-poll-option').first().click();
    cy.get('.e2e-send-poll').click();
    cy.get('.e2e-form-completed');
  });
});
