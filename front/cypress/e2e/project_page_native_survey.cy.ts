import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('New project with native survey', () => {
  const eventTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;

      cy.apiCreateEvent({
        projectId,
        title: eventTitle,
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().subtract(1, 'day').toDate(),
        endDate: moment().add(1, 'day').toDate(),
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  // TODO: Improve this test
  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
  });

  it('shows the survey buttons', () => {
    cy.contains('Take the survey').should('exist');

    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Project with native survey phase but not active', () => {
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.createProjectWithNativeSurveyPhase({
      phaseStartAt: '2018-03-01',
      phaseEndAt: '2019-01-01',
    }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Native survey CTA bar', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
          return cy
            .apiCreatePhase({
              projectId,
              title: 'phaseTitle1',
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'native_survey',
              nativeSurveyButtonMultiloc: { en: 'Take the survey' },
              nativeSurveyTitleMultiloc: { en: 'Survey' },
              canPost: true,
              canComment: true,
              canReact: true,
            })
            .then((phase) => {
              phaseId = phase.body.data.id;
            });
        });
      });
  });

  it('shows the CTA to the user to take the survey when taking survey is open', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#project-survey-button').should('exist');
  });

  it('does not show the CTA to take the survey when the user already taken the survey', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.setAdminLoginCookie();

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/access-rights`);

    cy.get('.e2e-action-accordion-posting_idea').click();

    cy.get('.e2e-action-form-posting_idea').within(() => {
      cy.get('.e2e-permission-registered-users').should('exist');
      cy.get('.e2e-permission-registered-users').first().click();
    });

    cy.logout();
    cy.setLoginCookie(email, password);

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.e2e-idea-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Save survey response
    cy.dataCy('e2e-submit-form').click();

    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('#project-survey-button').should('not.exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
