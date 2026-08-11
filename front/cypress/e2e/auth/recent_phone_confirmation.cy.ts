import { confirmPhone, logIn, logInWithPhone } from '../../support/auth';
import { randomString } from '../../support/commands';
import { updatePermission } from '../../support/permitted_by_utils';
import { createNativeSurveyProjectWithPermission } from './utils';

describe('Sign up - phone only', () => {
  let projectId = '';
  let phaseId = '';
  const projectTitle = randomString();

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_phone_number: true,
        confirmed_phone_number_expiry: 30,
      },
    }).then(({ projectId: id, phaseId: pid }) => {
      projectId = id;
      phaseId = pid;
    });
  });

  describe('If user is within phone expiry window', () => {
    it('does not require reconfirmation', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      logIn(cy, 'phone_confirmed_10_days_ago@govocal.com', 'democracy2.0');

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });

  describe('If user is outside phone expiry window', () => {
    before(() => {
      updatePermission({
        phaseId,
        confirmed_phone_number_expiry: 7,
      });
    });

    it('requires reconfirmation', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      logIn(cy, 'phone_confirmed_10_days_ago@govocal.com', 'democracy2.0');
      confirmPhone(cy);
      cy.get('#e2e-success-continue-button').click();

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

describe('Sign up - either email or phone', () => {
  let projectId = '';
  let phaseId = '';
  const projectTitle = randomString();

  // Signed up with a phone number only, confirmed 10 days ago.
  const phoneOnlyUserPhone = '+14155552672';

  const startFlow = () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
  };

  const expectSurveyOpened = () => {
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  };

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_email: false,
        require_confirmed_phone_number: false,
        confirmed_phone_number_expiry: 30,
      },
    }).then(({ projectId: id, phaseId: pid }) => {
      projectId = id;
      phaseId = pid;
    });
  });

  describe.only('If user is within phone expiry window', () => {
    it('does not require reconfirmation', () => {
      startFlow();

      logInWithPhone(cy, phoneOnlyUserPhone, 'democracy2.0');

      expectSurveyOpened();
    });
  });

  describe('If user is outside phone expiry window', () => {
    before(() => {
      updatePermission({
        phaseId,
        confirmed_phone_number_expiry: 7,
      });
    });

    it('requires reconfirmation', () => {
      startFlow();

      logInWithPhone(cy, phoneOnlyUserPhone, 'democracy2.0');
      confirmPhone(cy);
      cy.get('#e2e-success-continue-button').click();

      expectSurveyOpened();
    });

    it('does not require reconfirmation if the email address is still valid', () => {
      startFlow();

      // This user's phone number confirmation is just as stale, but their email
      // address has no expiry set, so the requirement is already satisfied.
      logIn(cy, 'phone_confirmed_10_days_ago@govocal.com', 'democracy2.0');

      expectSurveyOpened();
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
