import moment = require('moment');
import { randomString } from '../../support/commands';

// Regression test for the smart-group "Follow → one of the inputs" rule.
// The value selector used to fetch its candidate inputs with `transitive=true`,
// which restricts the result to ideas with no creation phase and therefore
// excludes proposals (proposals live in a proposals phase). We assert on the
// real /ideas request the selector fires, because the rendered option list is
// non-deterministic: the selector fetches tenant-wide inputs with `sort: random`
// and a 26-item page cap, so a "does the proposal appear in the dropdown" check
// would be flaky. The request no longer carrying `transitive=true` is the precise
// guard against re-introducing the bug.
describe('Smart group Follow rule "one of the inputs" selector', () => {
  const projectTitle = randomString();
  const proposalTitle = randomString(40);

  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  let projectId: string;

  before(() => {
    // A project with an active proposals phase + a published proposal in it.
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: twoMonthsAgo,
        endAt: inTwoMonths,
        participationMethod: 'proposals',
        canComment: true,
        canPost: true,
        canReact: true,
      }).then((phase) => {
        const proposalPhaseId = phase.body.data.id;
        cy.apiCreateIdea({
          projectId,
          ideaTitle: proposalTitle,
          ideaContent: randomString(60),
          phaseIds: [proposalPhaseId],
        });
      });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('fetches inputs without excluding proposals', () => {
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

    // The selector's request must not restrict inputs to non-proposal ideas.
    cy.wait('@ideaOptions').then((interception) => {
      expect(interception.request.url).not.to.include('transitive');
      expect(interception.response?.statusCode).to.eq(200);
    });
  });
});
