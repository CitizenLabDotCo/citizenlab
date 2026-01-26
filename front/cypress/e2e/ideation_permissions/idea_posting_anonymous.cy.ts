import moment = require('moment');
import { randomEmail, randomString } from '../../support/commands';
import { fillOutTitleAndBody } from './_utils';

describe('Timeline ideation with anonymous participation allowed', () => {
  const projectTitle = randomString(5);
  const email = randomEmail();
  const password = randomString(15);
  let projectId: string;
  let projectSlug: string;
  let userId: string;

  before(() => {
    cy.apiSignup('firstName', 'lastName', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.getAuthUser().then(() => {
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: '',
        description: '',
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
          allow_anonymous_participation: true,
        });
      });
    });
  });

  it('admin can submit anonymous idea', () => {
    const title = randomString(11);
    const body = randomString(40);

    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    fillOutTitleAndBody(cy, { title, body });

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // set to anonymous
    cy.get('[data-testid="e2e-post-idea-anonymously-checkbox"]').click();
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${title}`);
    cy.get('#e2e-idea-title').contains(title);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  it('resident can submit anonymous idea', () => {
    const title = randomString(11);
    const body = randomString(40);

    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}/ideas/new`);

    fillOutTitleAndBody(cy, { title, body });

    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // set to anonymous
    cy.get('[data-testid="e2e-post-idea-anonymously-checkbox"]').click();
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${title}`);
    cy.get('#e2e-idea-title').contains(title);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveProject(projectId);
  });
});
