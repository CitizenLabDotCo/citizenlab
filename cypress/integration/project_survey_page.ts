import { randomString } from '../support/commands';

describe('Continuous project with survey', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject(
      'continuous',
      projectTitle,
      projectDescriptionPreview,
      projectDescription,
      'published',
      'survey',
      undefined,
      'https://citizenlabco.typeform.com/to/Yv6B7V',
      'typeform'
    ).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.visit(`/projects/${projectSlug}/survey`);
    cy.wait(1000);
  });

  it('shows the survey', () => {
    cy.get('#e2e-continuous-project-survey-container');
    cy.get('.e2e-typeform-survey');
    cy.wait(5000);
    cy.get('.e2e-typeform-survey iframe');
    cy.get('.e2e-typeform-survey iframe').then(($iframe) => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body).find('#root').contains('Start');
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
  let phaseId: string;
  let phaseSlug: string;

  before(() => {
    cy.apiCreateProject('timeline', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
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
    }).then((phase) => {
      phaseId = phase.body.data.id;
      phaseSlug = phase.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.visit(`/projects/${projectSlug}/process`);
    cy.wait(1000);
  });

  it('shows the survey', () => {
    cy.get('.e2e-typeform-survey');
    cy.wait(5000);
    cy.get('.e2e-typeform-survey iframe');
    cy.get('.e2e-typeform-survey iframe').then(($iframe) => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body).find('#root').contains('Start');
    });
  });

   after(() => {
    cy.apiRemoveProject(projectId);
   });
});
