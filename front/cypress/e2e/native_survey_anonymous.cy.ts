import moment = require('moment');
import { randomString } from '../support/commands';

describe('Native survey: no authentication requirements', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string | undefined;
  let projectSlug: string | undefined;

  before(() => {
    // Create active project with one open ended phase
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      if (!projectId) return;
      return cy
        .apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        })
        .then((phase) => {
          const phaseId = phase.body.data.id;
          cy.apiSetPhasePermission({
            phaseId,
            action: 'posting_idea',
            permissionBody: {
              permission: {
                permitted_by: 'everyone',
              },
            },
          });
        });
    });
  });

  it('allows anyone to participate, and shows the idea id upon completion', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').click();
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Submit survey
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Expect success message with idea id
    cy.get('#idea-id-success-modal').should('exist');
  });

  after(() => {
    if (!projectId) return;
    cy.apiRemoveProject(projectId);
  });
});

describe('Native survey: anonymous toggle on', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string | undefined;
  let projectSlug: string | undefined;

  before(() => {
    // Create active project with one open ended phase
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      if (!projectId) return;
      return cy.apiCreatePhase({
        projectId,
        title: 'firstPhaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        participationMethod: 'native_survey',
        nativeSurveyButtonMultiloc: { en: 'Take the survey' },
        nativeSurveyTitleMultiloc: { en: 'Survey' },
        canPost: true,
        canComment: true,
        canReact: true,
        allow_anonymous_participation: true,
      });
    });
  });

  it('allows signed in users to participate, and shows the idea id upon completion', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').click();
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Submit survey
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Expect success message with idea id
    cy.get('#idea-id-success-modal').should('exist');
  });

  after(() => {
    if (!projectId) return;
    cy.apiRemoveProject(projectId);
  });
});
