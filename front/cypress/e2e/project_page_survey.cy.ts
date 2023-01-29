import { randomString } from '../support/commands';
import { skipOn } from '@cypress/skip-test';

describe('Existing continuous project with survey', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/projects/charlie-crew-survey');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the survey', () => {
    cy.get('.e2e-continuous-project-survey-container');
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

describe('New continuous project with survey', () => {
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
      publicationStatus: 'published',
      participationMethod: 'survey',
      surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
      surveyService: 'typeform',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
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

  it('shows the survey', () => {
    cy.get('.e2e-continuous-project-survey-container');
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
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline project with survey phase', () => {
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

      return cy.apiCreatePhase(
        projectId,
        phaseTitle,
        '2018-03-01',
        '2025-01-01',
        'survey',
        true,
        true,
        true,
        'description',
        'https://citizenlabco.typeform.com/to/Yv6B7V',
        'typeform'
      );
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
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline project with survey phase but not active', () => {
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

      return cy.apiCreatePhase(
        projectId,
        phaseTitle,
        '2018-03-01',
        '2019-01-01',
        'survey',
        true,
        true,
        true,
        'description',
        'https://citizenlabco.typeform.com/to/Yv6B7V',
        'typeform'
      );
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey or survey buttons', () => {
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
      participationMethod: 'survey',
      surveyUrl: 'https://citizenlabco.typeform.com/to/Yv6B7V',
      surveyService: 'typeform',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
  });

  it('does not show the survey or survey buttons', () => {
    cy.contains('Take the survey').should('not.exist');
    cy.contains('1 survey').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
