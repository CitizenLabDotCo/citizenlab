import { randomString } from '../support/commands';
import moment = require('moment');

describe('Idea form settings', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;

  beforeEach(() => {
    // create new project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      return cy.apiCreatePhase({
        projectId,
        title: 'firstPhaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });

    cy.setAdminLoginCookie();
  });

  describe('Input form tab', () => {
    const projectIds: string[] = [];
    let ideationPhaseIdInTimelineProject: string;
    let timelineWithIdeationProjectId: string;
    let budgetPhaseInTimelineproject: string;
    let timelineWithBudgetProjectId: string;

    const projectTitle = randomString();
    const description = randomString();

    before(() => {
      // Timeline project with ideation phase
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: description,
        description,
        publicationStatus: 'published',
      })
        .then((project) => {
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
        })
        .then((phase) => {
          ideationPhaseIdInTimelineProject = phase.body.data.id;
        });
      // Timeline project with budget phase
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description,
        publicationStatus: 'published',
      })
        .then((project) => {
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
        })
        .then((phase) => {
          budgetPhaseInTimelineproject = phase.body.data.id;
        });

      cy.setAdminLoginCookie();
    });

    after(() => {
      projectIds.forEach((id) => {
        cy.apiRemoveProject(id);
      });
    });

    it('is shown for projects with ideation or participatory budgeting', () => {
      // Timeline project with ideation phase
      cy.visit(
        `admin/projects/${timelineWithIdeationProjectId}/phases/${ideationPhaseIdInTimelineProject}/form`
      );
      cy.get('[data-cy="e2e-edit-input-form"]').should('be.visible');

      // // Timeline project with budget phase
      cy.visit(
        `admin/projects/${timelineWithBudgetProjectId}/phases/${budgetPhaseInTimelineproject}/form`
      );
      cy.get('[data-cy="e2e-edit-input-form"]').should('be.visible');
    });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });
});
