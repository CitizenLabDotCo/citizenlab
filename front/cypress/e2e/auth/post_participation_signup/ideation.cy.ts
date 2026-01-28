import { signUpEmailConformation, enterUserInfo } from '../../../support/auth';
import moment = require('moment');
import { randomString } from '../../../support/commands';
import { updatePermission } from '../../../support/permitted_by_utils';
import { fillOutTitleAndBody } from '../../ideation_permissions/_utils';

describe('Post Participation Signup: ideation', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  const firstName = randomString();
  const lastName = randomString();

  before(() => {
    cy.createProjectWithIdeationPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;

      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;

          // Set authentication requirement to 'everyone'
          return cy.request({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminJwt}`,
            },
            method: 'PATCH',
            url: `web_api/v1/phases/${phaseId}/permissions/posting_idea`,
            body: {
              permitted_by: 'everyone',
            },
          });
        });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('Allows claiming participation by post-participation signup', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);

    // add a title and description
    const ideaTitle = randomString();
    const ideaContent = randomString(60);
    cy.get('#title_multiloc').type(ideaTitle);
    cy.get('#title_multiloc').should('contain.value', ideaTitle);
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.get('#body_multiloc .ql-editor').type(ideaContent);
    cy.get('#body_multiloc .ql-editor').contains(ideaContent);
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Skip page with files
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Skip topics and location, submit
    cy.dataCy('e2e-submit-form').click();

    // Click button to enter post-participation sign up flow
    cy.dataCy('post-participation-signup').click();

    // Sign up
    signUpEmailConformation(cy);
    enterUserInfo(cy, { firstName, lastName });
    cy.get('#e2e-success-continue-button').find('button').click();

    // Make sure we get redirected to idea
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);

    // Make sure that idea belongs to user
    cy.get('.e2e-author-link').should(
      'have.attr',
      'href',
      `/en/profile/${firstName}-${lastName}`
    );
  });
});
