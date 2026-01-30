import { randomString } from '../../support/commands';
import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import { updatePermission } from '../../support/permitted_by_utils';

describe('Post Participation Signup: proposals', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  const firstName = randomString();
  const lastName = randomString();

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: 'Description preview',
      description: 'Description full',
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      return cy
        .apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2026-01-01',
          participationMethod: 'proposals',
          presentation_mode: 'card',
          canComment: true,
          canPost: true,
          canReact: true,
        })
        .then((response) => {
          phaseId = response.body.data.id;
          return updatePermission(cy, { phaseId, permitted_by: 'everyone' });
        });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('Allows claiming participation by post-participation signup', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.dataCy('e2e-ideation-start-idea-button').click();

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
