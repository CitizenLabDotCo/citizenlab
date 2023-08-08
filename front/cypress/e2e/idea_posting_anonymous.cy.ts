import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Continuous ideation with anonymous participation allowed', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  const email = randomEmail();
  const password = randomString(15);
  let projectId: string;
  let projectSlug: string;
  let userId: string;

  before(() => {
    cy.apiSignup('firstName', 'lastName', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
          participationMethod: 'ideation',
          votingMaxTotal: 400,
          allow_anonymous_participation: true,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      });
  });

  it('admin can submit anonymous idea', () => {
    const ideaTitle = randomString(20);
    const ideaContent = randomString(60);

    cy.setAdminLoginCookie();

    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').should('exist');
    cy.get('#e2e-post-anonymously-checkbox').click();

    // save the form
    cy.get('.e2e-submit-idea-form').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(ideaTitle);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  it('resident can submit anonymous idea', () => {
    const ideaTitle = randomString(20);
    const ideaContent = randomString(60);

    cy.setLoginCookie(email, password);

    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').should('exist');
    cy.get('#e2e-post-anonymously-checkbox').click();

    // save the form
    cy.get('.e2e-submit-idea-form').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(ideaTitle);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveProject(projectId);
  });
});

describe('Timeline ideation with anonymous participation allowed', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  const email = randomEmail();
  const password = randomString(15);
  let projectId: string;
  let projectSlug: string;
  let userId: string;

  before(() => {
    cy.apiSignup('firstName', 'lastName', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.setAdminLoginCookie();
    cy.getAuthUser().then(() => {
      cy.apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: '',
        description: '',
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        cy.apiCreatePhase(
          projectId,
          'phaseTitle',
          moment().subtract(2, 'month').format('DD/MM/YYYY'),
          moment().add(2, 'days').format('DD/MM/YYYY'),
          'ideation',
          true,
          true,
          true,
          undefined,
          undefined,
          undefined,
          undefined,
          true
        );
      });
    });
  });

  it('admin can submit anonymous idea', () => {
    const ideaTitle = randomString(20);
    const ideaContent = randomString(60);

    cy.setAdminLoginCookie();

    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').should('exist');
    cy.get('#e2e-post-anonymously-checkbox').click();

    // save the form
    cy.get('.e2e-submit-idea-form').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(ideaTitle);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  it('resident can submit anonymous idea', () => {
    const ideaTitle = randomString(20);
    const ideaContent = randomString(60);

    cy.setLoginCookie(email, password);

    cy.visit(`/projects/${projectSlug}/ideas/new`);

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // add a title and description
    cy.get('#e2e-idea-title-input input').type(ideaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(ideaContent);

    // set to anonymous
    cy.get('#e2e-post-anonymously-checkbox').should('exist');
    cy.get('#e2e-post-anonymously-checkbox').click();

    // save the form
    cy.get('.e2e-submit-idea-form').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show').find('#e2e-idea-title').contains(ideaTitle);

    // verify that the author is anonymous
    cy.get('#e2e-anonymous-username').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveProject(projectId);
  });
});
