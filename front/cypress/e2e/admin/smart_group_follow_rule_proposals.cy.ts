import moment = require('moment');
import { randomString } from '../../support/commands';

// Regression + behaviour test for the smart-group "Follow → one of the inputs"
// rule's value selector. The selector lists followable inputs by fetching
// `/ideas` (via `useIdeas`). The fix here removed `transitive=true`, which had
// excluded proposals (proposals live in a proposals phase, so they have a
// non-nil creation_phase). This test guards the front-end concern: that the
// selector fires `/ideas` without `transitive`, and that native-survey
// responses are never offered.
//
// Which inputs `/ideas` returns (proposals and ideas in, survey responses out,
// via IdeasFinder's `.publicly_visible`) is a back-end concern and is covered in
// back/spec/acceptance/ideas/ideas_index_spec.rb — it can't be asserted
// deterministically here anyway, since the selector receives a random 26-item
// page.
describe('Smart group Follow rule "one of the inputs" selector', () => {
  const proposalTitle = randomString(40);
  const regularIdeaTitle = randomString(40);
  const surveyResponseTitle = randomString(40);

  const nineMonthsAgo = moment().subtract(9, 'month').format('DD/MM/YYYY');
  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  // Separate projects keep each phase on its own timeline (phases within one
  // project cannot overlap).
  let proposalsProjectId: string;
  let ideationProjectId: string;
  let surveyProjectId: string;
  let surveyResponseId: string;

  const createProject = () =>
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    });

  before(() => {
    // Proposals phase + a published proposal (non-nil creation_phase).
    createProject().then((project) => {
      proposalsProjectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId: proposalsProjectId,
        title: randomString(),
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'proposals',
        canComment: true,
        canPost: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          projectId: proposalsProjectId,
          ideaTitle: proposalTitle,
          ideaContent: randomString(60),
          phaseIds: [phase.body.data.id],
        });
      });
    });

    // Ideation phase + a regular idea (nil creation_phase, publicly visible).
    createProject().then((project) => {
      ideationProjectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId: ideationProjectId,
        title: randomString(),
        startAt: nineMonthsAgo,
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          projectId: ideationProjectId,
          ideaTitle: regularIdeaTitle,
          ideaContent: randomString(60),
          phaseIds: [phase.body.data.id],
        });
      });
    });

    // Native-survey phase + a survey response (creation_phase is a survey phase,
    // so it is NOT publicly visible and must never be offered as an input).
    createProject().then((project) => {
      surveyProjectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId: surveyProjectId,
        title: randomString(),
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'native_survey',
        nativeSurveyButtonMultiloc: { en: 'Take the survey' },
        nativeSurveyTitleMultiloc: { en: 'Survey' },
        canComment: true,
        canPost: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          projectId: surveyProjectId,
          ideaTitle: surveyResponseTitle,
          ideaContent: randomString(60),
          phaseIds: [phase.body.data.id],
        }).then((idea) => {
          surveyResponseId = idea.body.data.id;
        });
      });
    });
  });

  after(() => {
    [proposalsProjectId, ideationProjectId, surveyProjectId].forEach((id) => {
      if (id) cy.apiRemoveProject(id);
    });
  });

  it('offers ideas and proposals as inputs, but not survey responses', () => {
    cy.intercept('GET', '**/web_api/v1/ideas?*').as('ideaOptions');

    cy.setAdminLoginCookie();
    cy.visit('/en/admin/users/groups');

    // Open the create-group modal and pick the smart (rules-based) group type.
    cy.get('.e2e-create-group-button').click();
    cy.get('.e2e-create-rules-group-button').click();

    // The rules form renders one empty rule by default. Choose Follow, then the
    // "one of the inputs" predicate — this mounts the inputs value selector,
    // which fires the /ideas request we assert on.
    cy.get('#e2e-rule-0-field-e2e-e2e').select('Follow');
    cy.get('.e2e-rules-field-section')
      .find('select')
      .eq(1)
      .select('one of the inputs');

    cy.wait('@ideaOptions').then((interception) => {
      // The selector must not restrict inputs to non-proposal ideas.
      expect(interception.request.url).not.to.include('transitive');
      expect(interception.response?.statusCode).to.eq(200);

      // Survey responses are never publicly visible, so are never offered —
      // robust regardless of which random page the selector received.
      const offeredIds = interception.response?.body.data.map(
        (idea: { id: string }) => idea.id
      );
      expect(offeredIds).not.to.include(surveyResponseId);
    });
  });
});
