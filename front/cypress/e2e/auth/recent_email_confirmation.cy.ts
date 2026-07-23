import {
  confirmEmail,
  logIn,
  signUpEmailConformation,
} from '../../support/auth';
import { randomString } from '../../support/commands';
import { updatePermission } from '../../support/permitted_by_utils';
import { createNativeSurveyProjectWithPermission } from './utils';

describe('Sign up - email only', () => {
  let projectId = '';
  let phaseId = '';
  const projectTitle = randomString();

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        confirmed_email_expiry: 30,
      },
    }).then(({ projectId: id, phaseId: pid }) => {
      projectId = id;
      phaseId = pid;
    });
  });

  describe('If user is within email expiry window', () => {
    it('does not require reconfirmation', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      logIn(cy, 'email_confirmed_10_days_ago@govocal.com', 'democracy2.0');

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });

  describe('If user is outside email expiry window', () => {
    before(() => {
      updatePermission({
        phaseId,
        confirmed_email_expiry: 7,
      });
    });

    it('requires reconfirmation', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      logIn(cy, 'email_confirmed_10_days_ago@govocal.com', 'democracy2.0');
      confirmEmail(cy);

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
