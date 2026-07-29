import { logIn, signUpEmailConformation } from '../../support/auth';
import { randomString } from '../../support/commands';
import { createNativeSurveyProjectWithPermission } from './utils';

describe('Sign up - email only', () => {
  let projectId = '';
  const projectTitle = randomString();

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_name: false,
        require_password: false,
      },
    }).then(({ projectId: id }) => {
      projectId = id;
    });
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('works when signing up with existing normal user', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    logIn(cy, 'admin@govocal.com', 'democracy2.0');

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
