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
        cy.apiCreatePhase(
          timelineWithIdeationProjectId,
          'phaseTitle',
          moment().subtract(2, 'month').format('DD/MM/YYYY'),
          moment().add(2, 'days').format('DD/MM/YYYY'),
          'ideation',
          true,
          true,
          true
        );
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
        cy.apiCreatePhase(
          timelineWithBudgetProjectId,
          'phaseTitle',
          moment().add(5, 'month').format('DD/MM/YYYY'),
          moment().add(7, 'month').format('DD/MM/YYYY'),
          'budgeting',
          true,
          true,
          true,
          description,
          'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          'typeform',
          400
        );
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
        cy.apiCreatePhase(
          timelineWithNativeSurveyProjectId,
          'phaseTitle',
          moment().add(5, 'month').format('DD/MM/YYYY'),
          moment().add(7, 'month').format('DD/MM/YYYY'),
          'native_survey',
          true,
          true,
          true,
          description,
          'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          'typeform',
          400
        );
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
        participationMethod: 'budgeting',
        maxBudget: 100,
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
        cy.apiCreatePhase(
          timelineWithoutIdeationOrBudgetProjectId,
          'phaseTitle',
          moment().subtract(2, 'month').format('DD/MM/YYYY'),
          moment().add(2, 'days').format('DD/MM/YYYY'),
          'poll',
          true,
          true,
          true
        );
        cy.apiCreatePhase(
          timelineWithoutIdeationOrBudgetProjectId,
          'phaseTitle',
          moment().add(3, 'days').format('DD/MM/YYYY'),
          moment().add(2, 'month').format('DD/MM/YYYY'),
          'survey',
          true,
          true,
          true,
          description,
          'https://lifeship.typeform.com/to/YWeOlPu7?typeform-source=clickydrip.com',
          'typeform'
        );
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
