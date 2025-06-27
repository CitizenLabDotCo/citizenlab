import moment = require('moment');
import { randomString } from '../support/commands';
import { skipOn } from '@cypress/skip-test';

let projectId: string;
let projectSlug: string;

describe('Existing project with survey', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/projects/charlie-crew-survey');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  // TODO: Improve this test
  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
  });

  it('shows the survey', () => {
    cy.get('.e2e-typeform-survey');
    cy.wait(3000);
    cy.get('.e2e-typeform-survey iframe');

    // This test always fails on firefox, even though it's
    // working fine. For now we will skip it
    // https://stackoverflow.com/a/64939524
    skipOn('firefox', () => {
      cy.get('.e2e-typeform-survey iframe').then(($iframe) => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('#root').contains('Enter');
      });
    });
  });
});

describe('New project with survey', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);

  const phaseTitle = randomString();

  before(() => {
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
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'survey',
          surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
          surveyService: 'typeform',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then(() => {
        cy.apiCreateEvent({
          projectId,
          title: 'Event title',
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

  it('shows event CTA button', () => {
    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('exist');
  });

  it('shows the survey', () => {
    cy.get('.e2e-typeform-survey');
    cy.wait(3000);
    cy.get('.e2e-typeform-survey iframe');

    skipOn('firefox', () => {
      cy.get('.e2e-typeform-survey iframe').then(($iframe) => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('#root').contains('Start');
      });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });
});

describe('Timeline project with survey phase', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const phaseTitle = randomString();

  before(() => {
    cy.apiCreateProject({
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
        participationMethod: 'survey',
        canComment: true,
        canPost: true,
        canReact: true,
        description: 'description',
        surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
        surveyService: 'typeform',
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  it('shows the survey', () => {
    cy.get('.e2e-typeform-survey');
    cy.wait(3000);
    cy.get('.e2e-typeform-survey iframe');

    skipOn('firefox', () => {
      cy.get('.e2e-typeform-survey iframe').then(($iframe) => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('#root').contains('Start');
      });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });
});

describe('Timeline project with survey phase but not active', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const phaseTitle = randomString();

  before(() => {
    cy.apiCreateProject({
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
        participationMethod: 'survey',
        canComment: true,
        canPost: true,
        canReact: true,
        description: 'description',
        surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
        surveyService: 'typeform',
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey or survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });
});

describe('Archived single phase project with survey', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'archived',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy.apiCreatePhase({
        projectId,
        title: 'phaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        participationMethod: 'survey',
        surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
        surveyService: 'typeform',
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey or survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });
});

describe('Embedded survey CTA', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy.apiCreatePhase({
        projectId,
        title: 'phaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        participationMethod: 'survey',
        surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
        surveyService: 'typeform',
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });
  });

  it('shows the CTA button on visting the project page of an active survey project', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-take-survey-button').should('exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });
});
