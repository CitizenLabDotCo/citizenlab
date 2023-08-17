import { randomString, apiRemoveProject } from '../support/commands';
import moment = require('moment');

describe('Idea form settings', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    // create new project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    cy.setAdminLoginCookie();
  });

  describe('Input form tab', () => {
    const projectIds: string[] = [];
    let continuousIdeationProjectId: string;
    let continuousBudgetProjectId: string;
    let continuousPollProjectId: string;
    let timelineWithIdeationProjectId: string;
    let timelineWithBudgetProjectId: string;
    let timelineWithNativeSurveyProjectId: string;
    let timelineWithoutIdeationOrBudgetProjectId: string;

    const projectTitle = randomString();
    const description = randomString();

    before(() => {
      // Continuous ideation project
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'published',
        participationMethod: 'ideation',
      }).then((project) => {
        projectIds.push(project.body.data.id);
        continuousIdeationProjectId = project.body.data.id;
      });
      // Timeline project with ideation phase
      cy.apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'published',
      }).then((project) => {
        timelineWithIdeationProjectId = project.body.data.id;
        cy.apiCreatePhase({
          projectId: timelineWithIdeationProjectId,
          title: 'phaseTitle',
          startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canReact: true,
          canComment: true,
        });
      });
      // Timeline project with budget phase
      cy.apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description,
        publicationStatus: 'published',
      }).then((project) => {
        timelineWithBudgetProjectId = project.body.data.id;
        cy.apiCreatePhase({
          projectId: timelineWithBudgetProjectId,
          title: 'phaseTitle',
          startAt: moment().add(5, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(7, 'month').format('DD/MM/YYYY'),
          participationMethod: 'voting',
          canComment: true,
          canPost: true,
          canReact: true,
          description,
          surveyUrl:
            'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          surveyService: 'typeform',
          votingMaxTotal: 400,
          allow_anonymous_participation: undefined,
          votingMethod: 'budgeting',
        });
      });

      // Timeline project with native_survey phase
      cy.apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description,
        publicationStatus: 'published',
      }).then((project) => {
        timelineWithNativeSurveyProjectId = project.body.data.id;
        cy.apiCreatePhase({
          projectId: timelineWithNativeSurveyProjectId,
          title: 'phaseTitle',
          startAt: moment().add(5, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(7, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          canComment: true,
          canPost: true,
          canReact: true,
          description,
          surveyUrl:
            'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          surveyService: 'typeform',
          votingMaxTotal: 400,
        });
      });

      // Continuous poll project
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'draft',
        participationMethod: 'poll',
      }).then((project) => {
        continuousPollProjectId = project.body.data.id;
        projectIds.push(continuousPollProjectId);
      });

      // Continuous budget project
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'draft',
        participationMethod: 'voting',
        votingMethod: 'budgeting',
        votingMaxTotal: 100,
      }).then((project) => {
        continuousBudgetProjectId = project.body.data.id;
        projectIds.push(continuousBudgetProjectId);
      });

      // Timeline project without ideation phase
      cy.apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'published',
      }).then((project) => {
        timelineWithoutIdeationOrBudgetProjectId = project.body.data.id;
        cy.apiCreatePhase({
          projectId: timelineWithoutIdeationOrBudgetProjectId,
          title: 'phaseTitle',
          startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
          participationMethod: 'poll',
          canComment: true,
          canPost: true,
          canReact: true,
        });
        cy.apiCreatePhase({
          projectId: timelineWithoutIdeationOrBudgetProjectId,
          title: 'phaseTitle',
          startAt: moment().add(3, 'days').format('DD/MM/YYYY'),
          endAt: moment().add(2, 'month').format('DD/MM/YYYY'),
          participationMethod: 'survey',
          canComment: true,
          canPost: true,
          canReact: true,
          description,
          surveyUrl:
            'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          surveyService: 'typeform',
        });
      });

      cy.setAdminLoginCookie();
    });

    after(() => {
      projectIds.forEach((id) => {
        cy.apiRemoveProject(id);
      });
    });

    it('is shown for projects with ideation or participatory budgeting', () => {
      // Continuous ideation project
      cy.visit(`admin/projects/${continuousIdeationProjectId}/ideaform`);
      cy.acceptCookies();
      cy.get('[data-cy="e2e-edit-input-form"]').should('exist');

      // Timeline project with ideation phase
      cy.visit(`admin/projects/${timelineWithIdeationProjectId}/ideaform`);
      cy.get('[data-cy="e2e-edit-input-form"]').should('exist');

      // // Timeline project with budget phase
      cy.visit(`admin/projects/${timelineWithBudgetProjectId}/ideaform`);
      cy.get('[data-cy="e2e-edit-input-form"]').should('exist');

      // // Continuous budget project
      cy.visit(`admin/projects/${continuousBudgetProjectId}/ideaform`);
      cy.get('[data-cy="e2e-edit-input-form"]').should('exist');
    });

    it('is not shown for projects without an ideation phase', () => {
      // Continuous poll project
      cy.visit(`admin/projects/${continuousPollProjectId}/ideaform`);
      cy.get('[data-cy="e2e-edit-input-form"]').should('not.exist');

      // Timeline project without ideation or budget phase
      cy.visit(
        `admin/projects/${timelineWithoutIdeationOrBudgetProjectId}/ideaform`
      );
      cy.get('[data-cy="e2e-edit-input-form"]').should('not.exist');

      // Timeline project with native survey phase
      cy.visit(`admin/projects/${timelineWithNativeSurveyProjectId}/ideaform`);
      cy.get('[data-cy="e2e-edit-input-form"]').should('not.exist');
    });
  });

  afterEach(() => {
    apiRemoveProject(projectId);
  });
});
