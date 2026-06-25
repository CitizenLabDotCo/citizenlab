import moment = require('moment');
import { randomString } from '../../support/commands';

// Behaviour tests for the smart-group "Follow" input value selectors, which were
// switched from a fixed 26-random-input dropdown to a searchable, infinite-scroll
// picker (IdeaSelect / IdeaMultiSelect). These assert what the old non-searchable
// dropdown could not: that an arbitrary input is findable by title and selectable.
//
// The candidate inputs are created here via the API (rather than relying on the
// e2e template's seeded content), so the titles searched for are known and stable.
describe('Smart group "Follow" input value selectors', () => {
  const ideaTitleA = randomString(20);
  const ideaTitleB = randomString(20);
  const proposalTitle = randomString(20);

  const nineMonthsAgo = moment().subtract(9, 'month').format('DD/MM/YYYY');
  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  // Two projects keeps the ideation and proposals phases on independent
  // timelines (phases within one project cannot overlap).
  let ideationProjectId: string;
  let proposalsProjectId: string;

  before(() => {
    // Ideation project + phase with two published inputs.
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
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
            projectId: ideationProjectId,
            ideaTitle,
            ideaContent: randomString(60),
            phaseIds: [phaseId],
          });
        });
      });
    });

    // Separate project with a proposals phase + a published proposal. Proposals
    // were the inputs the old `transitive=true` fetch excluded.
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
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
          projectId: proposalsProjectId,
          ideaTitle: proposalTitle,
          ideaContent: randomString(60),
          phaseIds: [phase.body.data.id],
        });
      });
    });
  });

  after(() => {
    if (ideationProjectId) cy.apiRemoveProject(ideationProjectId);
    if (proposalsProjectId) cy.apiRemoveProject(proposalsProjectId);
  });

  // Opens the create-smart-group modal and selects the Follow rule with the given
  // predicate, which mounts the input value selector under test.
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

    // The selector fetches its first page on mount; that request must not carry
    // `transitive` (which would exclude proposals).
    cy.wait('@ideaOptions')
      .its('request.url')
      .should('not.include', 'transitive');
  };

  it('searches and selects multiple inputs for "one of the inputs"', () => {
    openFollowRule('one of the inputs');

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
    openFollowRule('excludes input');

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
