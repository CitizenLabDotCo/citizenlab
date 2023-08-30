import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('New continuous project with native survey', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const eventTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

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

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the survey buttons', () => {
    cy.contains('Take the survey').should('exist');
    cy.contains('1 survey').should('exist');

    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline project with native survey phase', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const phaseTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      return cy.apiCreatePhase({
        projectId,
        title: phaseTitle,
        startAt: '2018-03-01',
        endAt: '5025-01-01',
        participationMethod: 'native_survey',
        canComment: true,
        canPost: true,
        canReact: true,
        description: 'description',
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  it('shows the survey buttons', () => {
    cy.contains('Take the survey').should('exist');
    cy.contains('1 survey').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline project with native survey phase but not active', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const phaseTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      return cy.apiCreatePhase({
        projectId,
        title: phaseTitle,
        startAt: '2018-03-01',
        endAt: '2019-01-01',
        participationMethod: 'native_survey',
        canComment: true,
        canPost: true,
        canReact: true,
        description: 'description',
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
    cy.contains('1 survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Archived continuous project with survey', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'archived',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
    cy.contains('1 survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Modal shown after survey submission', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'archived',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/?show_modal=true`);
  });

  it('shows the modal', () => {
    cy.contains('Thank you. Your response has been received.').should('exist');
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
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          participationMethod: 'native_survey',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
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

    cy.visit(`admin/projects/${projectId}/permissions`);
    cy.get('#e2e-granular-permissions').within(() => {
      cy.get('#e2e-permission-registered-users').should('exist');
      cy.get('#e2e-permission-registered-users').click();
    });

    cy.logout();
    cy.setLoginCookie(email, password);

    // Take the survey
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-cta-button')
      .find('button')
      .should('not.have.attr', 'disabled');
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response

    cy.get('[data-cy="e2e-submit-form"]').click();

    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('#project-survey-button').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
