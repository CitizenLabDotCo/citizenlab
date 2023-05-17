import { randomString, randomEmail } from '../support/commands';

describe('Idea posting anonymous', () => {
  let projectId = '';
  let projectSlug = '';

  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((response) => {
      projectId = response.body.data.id;
      projectSlug = response.body.data.attributes.slug;
    });

    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.get('#idea-form');
    cy.acceptCookies();
  });

  it('lets you post anonymously', () => {
    const ideaTitle = randomString();
    const ideaContent = randomString(300);

    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    cy.get('.e2e-checkbox').first().click();
    cy.get('.e2e-submit-idea-form').click();

    cy.get('#e2e-idea-show');
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);

    cy.get('.e2e-modal-close-button').should('exist');
    cy.get('.e2e-modal-close-button').first().click();

    cy.get('e2e-username').should('include.text', 'Anonymous');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
