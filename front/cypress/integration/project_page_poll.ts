import { randomString } from '../support/commands';

describe('Existing continuous project with poll', () => {
  before(() => {
    cy.visit('/projects/the-big-poll');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the poll', () => {
    cy.get('.e2e-continuous-project-poll-container');
    cy.get('.e2e-poll-form');
  });
});

describe('New continuous project with poll', () => {
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
      participationMethod: 'poll',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      cy.apiAddPoll(
        'Project',
        projectId,
        [
          {
            title: 'What is your favourite ice cream flavour?',
            type: 'multiple_options',
          },
          {
            title: 'Are you in favour of car-free sundays ?',
            type: 'single_option',
          },
        ],
        [
          ['Vanilla', 'Chocolate', 'Pistachio'],
          ['Yes', 'No', 'I decline to answer'],
        ]
      );
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.wait(2000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the poll', () => {
    cy.get('.e2e-continuous-project-poll-container');
    cy.get('.e2e-poll-form');
  });

  it('lets user answer it', () => {
    cy.get('.e2e-continuous-project-poll-container')
      .get('.e2e-poll-question')
      .each((question) => question.find('.e2e-poll-option').first().click());
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

  before(() => {
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
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
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        cy.apiAddPoll(
          'Phase',
          phaseId,
          [
            {
              title: 'What is your favourite ice cream flavour?',
              type: 'multiple_options',
            },
            {
              title: 'Are you in favour of car-free sundays ?',
              type: 'single_option',
            },
          ],
          [
            ['Vanilla', 'Chocolate', 'Pistachio'],
            ['Yes', 'No', 'I decline to answer'],
          ]
        );
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
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

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
