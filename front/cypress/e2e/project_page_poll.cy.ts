import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Existing single phase project with poll', () => {
  beforeEach(() => {
    cy.visit('/projects/the-big-poll');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  // TODO: Improve this test
  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
  });

  it('shows the poll', () => {
    cy.get('.e2e-timeline-project-poll-container');
    cy.get('.e2e-poll-form');
  });
});

describe('Timeline project with poll phase', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const phaseTitle = randomString();
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: '2018-03-01',
          participationMethod: 'poll',
          canComment: true,
          canPost: true,
          canReact: true,
          description: 'description',
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        cy.apiAddPoll(
          phaseId,
          [
            {
              title: 'What is your favourite ice cream flavour?',
              type: 'multiple_options',
            },
          ],
          [['Vanilla', 'Chocolate', 'Pistachio']]
        );
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);

    cy.wait(2000);
  });

  it('shows the poll', () => {
    cy.get('.e2e-timeline-project-poll-container');
    cy.get('.e2e-poll-form');
  });

  it('lets user answer it', () => {
    cy.wait(100);
    cy.get('.e2e-timeline-project-poll-container')
      .get('.e2e-poll-question')
      .each((question) => question.find('.e2e-poll-option').first().click());
    cy.wait(500);
    cy.get('.e2e-send-poll').click();
    cy.get('.e2e-form-completed');
  });

  it('lets non-admin, registered users answer it', () => {
    // set normal user cookie
    cy.clearCookies();
    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();

    cy.wait(100);
    cy.get('.e2e-timeline-project-poll-container')
      .get('.e2e-poll-question')
      .each((question) => question.find('.e2e-poll-option').first().click());
    cy.wait(500);
    cy.get('.e2e-send-poll').click();
    cy.get('.e2e-form-completed');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('poll submission for users who have not met all the registration requirements', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    // create user
    cy.apiCreateCustomField(randomFieldName, true).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it("doesn't let users missing registration requirements submit a poll response", () => {
    cy.setLoginCookie(email, password);
    cy.visit('/projects/the-big-poll');
    cy.get('.e2e-timeline-project-poll-container')
      .get('.e2e-poll-question')
      .each((question) => question.find('.e2e-poll-option').first().click());
    cy.wait(500);
    cy.get('.e2e-send-poll').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});
