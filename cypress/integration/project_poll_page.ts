import { randomString } from '../support/commands';

describe('Continuous project with poll', () => {
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
      'poll'
    ).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      cy.apiAddPoll('Project', projectId, ['What is your favourite ice cream flavour ?', 'Are you in favour of car-free sundays ?'], [['Vanilla', 'Chocolate', 'Pistachio'], ['Yes', 'No', 'I decline to answer']]);
    });
  });

  beforeEach(() => {
    cy.login('admin@citizenlab.co', 'testtest');
    cy.acceptCookies();
    cy.visit(`/projects/${projectSlug}/poll`);
    cy.wait(2000);
  });

  it('shows the poll', () => {
    cy.get('.e2e-continuous-project-poll-container');
    cy.get('.e2e-poll-form');
  });

  it('lets user answer it', () => {
    cy.get('.e2e-continuous-project-poll-container').get('.e2e-poll-question').each(question =>
      question.find('.e2e-poll-option').first().click()
    );
    cy.get('.e2e-send-poll').click();
    cy.get('.e2e-form-completed');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline project with poll phase', () => {
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
        'poll',
        true,
        true,
        true,
        'description'
      );
    }).then((phase) => {
      phaseId = phase.body.data.id;
      phaseSlug = phase.body.data.attributes.slug;
      return cy.apiAddPoll('Phase', phaseId, ['What is your favourite ice cream flavour ?', 'Are you in favour of car-free sundays ?'], [['Vanilla', 'Chocolate', 'Pistachio'], ['Yes', 'No', 'I decline to answer']]);
    });
  });

  beforeEach(() => {
    cy.visit(`/projects/${projectSlug}/process`);
    cy.wait(1000);
  });

  it('shows the poll', () => {
    cy.get('.e2e-timeline-project-poll-container');
    cy.get('.e2e-poll-form');
  });

   after(() => {
    cy.apiRemoveProject(projectId);
   });
});
