import moment = require('moment');
import { randomString } from '../../support/commands';

// Behaviour + regression tests for the smart-group "Follow" input value
// selectors. They were switched from a fixed 26-random-input dropdown to a
// searchable, infinite-scroll picker (IdeaSingleSelect / IdeaMultiSelect), and
// list followable inputs by fetching `/ideas`. The underlying fix removed
// `transitive=true`, which had excluded proposals (proposals live in a proposals
// phase, so they have a non-nil creation_phase).
//
// Coverage:
//  - the /ideas request carries no `transitive`, so proposals are not excluded;
//  - survey responses are never publicly visible, so are never offered as inputs;
//  - an arbitrary input is findable by title and selectable (multi and single).
//
// Candidate inputs are created via the API (not the seeded e2e template) so the
// titles searched for are known and stable.
describe('Smart group "Follow" input value selectors', () => {
  const ideaTitleA = randomString(20);
  const ideaTitleB = randomString(20);
  const proposalTitle = randomString(20);
  const surveyResponseTitle = randomString(20);

  const nineMonthsAgo = moment().subtract(9, 'month').format('DD/MM/YYYY');
  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  // A separate project per phase keeps each on an independent timeline (phases
  // within one project cannot overlap).
  let ideationProjectId: string;
  let proposalsProjectId: string;
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
    // Ideation phase + two published inputs (nil creation_phase, publicly visible).
    createProject().then((project) => {
      ideationProjectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId: ideationProjectId,
        title: randomString(),
        startAt: nineMonthsAgo,
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        const phaseId = phase.body.data.id;
        [ideaTitleA, ideaTitleB].forEach((ideaTitle) => {
          cy.apiCreateIdea({
            phaseId,
            ideaTitle,
            ideaContent: randomString(60),
          });
        });
      });
    });

    // Proposals phase + a published proposal (non-nil creation_phase). Proposals
    // were the inputs the old `transitive=true` fetch excluded.
    createProject().then((project) => {
      proposalsProjectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId: proposalsProjectId,
        title: randomString(),
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'proposals',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          phaseId: phase.body.data.id,
          ideaTitle: proposalTitle,
          ideaContent: randomString(60),
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
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          phaseId: phase.body.data.id,
          ideaTitle: surveyResponseTitle,
          ideaContent: randomString(60),
        }).then((idea) => {
          surveyResponseId = idea.body.data.id;
        });
      });
    });
  });

  after(() => {
    [ideationProjectId, proposalsProjectId, surveyProjectId].forEach((id) => {
      if (id) cy.apiRemoveProject(id);
    });
  });

  // Opens the create-smart-group modal and selects the Follow rule with the given
  // predicate, which mounts the input value selector under test. Returns the
  // mount-time `/ideas?…` request so callers can assert on it.
  const openFollowRule = (predicateLabel: string) => {
    // Regex (literal `?`) matches only the `/ideas?…` list requests, never the
    // `/ideas/:id` item requests the selector fires to resolve selected titles.
    cy.intercept('GET', /\/web_api\/v1\/ideas\?/).as('ideaOptions');

    cy.setAdminLoginCookie();
    cy.visit('/en/admin/users/groups');

    cy.get('.e2e-create-group-button').click();
    cy.get('.e2e-create-rules-group-button').click();

    cy.get('#e2e-rule-0-field-e2e-e2e').select('Follow');
    cy.get('.e2e-rules-field-section')
      .find('select')
      .eq(1)
      .select(predicateLabel);

    return cy.wait('@ideaOptions');
  };

  it('offers ideas and proposals as inputs, but not survey responses', () => {
    openFollowRule('one of the inputs').then((interception) => {
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

  it('searches and selects multiple inputs for "one of the inputs"', () => {
    openFollowRule('one of the inputs')
      .its('request.url')
      .should('not.include', 'transitive');

    cy.get('.e2e-rules-field-section').within(() => {
      // Find a specific input by title and select it.
      cy.get('#idea-multi-select-input').type(ideaTitleA);
      cy.contains('[role="option"]', ideaTitleA, { timeout: 10000 }).click();
      // The chip is rendered from the selected id resolved via /ideas/:id.
      cy.contains(ideaTitleA, { timeout: 10000 }).should('be.visible');

      // Add a second input (multi-select).
      cy.get('#idea-multi-select-input').type(ideaTitleB);
      cy.contains('[role="option"]', ideaTitleB, { timeout: 10000 }).click();
      cy.contains(ideaTitleB, { timeout: 10000 }).should('be.visible');
      cy.contains(ideaTitleA).should('be.visible'); // first chip still there

      // A proposal is searchable too (proposals are no longer excluded).
      cy.get('#idea-multi-select-input').type(proposalTitle);
      cy.contains('[role="option"]', proposalTitle, { timeout: 10000 }).should(
        'be.visible'
      );
    });
  });

  it('searches and selects a single input for "excludes input"', () => {
    openFollowRule('excludes input')
      .its('request.url')
      .should('not.include', 'transitive');

    cy.get('.e2e-rules-field-section').within(() => {
      cy.get('#idea-select-input').type(ideaTitleA);
      cy.contains('[role="option"]', ideaTitleA, { timeout: 10000 }).click();
    });

    // The chosen input's title is shown as the selected value. react-select's
    // single value sits under the transparent input overlay, so assert on text
    // content rather than visibility (which reports it "covered").
    cy.get('.e2e-rules-field-section', { timeout: 10000 }).should(
      'contain.text',
      ideaTitleA
    );
  });
});
