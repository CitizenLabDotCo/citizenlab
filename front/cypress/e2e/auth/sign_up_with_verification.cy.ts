import { enterUserInfo, signUpEmailConformation } from '../../support/auth';
import { randomString } from '../../support/commands';
import moment = require('moment');
import { fakeSSOAuth } from './utils';

describe('Sign up - verification required (bogus)', () => {
  let projectId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.apiSetPhasePermission({
          phaseId,
          permissionBody: {
            permitted_by: 'users',
            require_verification: true,
          },
          action: 'posting_idea',
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);
    enterUserInfo(cy);

    // verification step: fill out bogus
    cy.get(
      '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
    ).click();
    cy.get('#e2e-verification-bogus-form');
    cy.get('#e2e-verification-bogus-submit-button').click();

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  });

  describe('Does not require name and password', () => {
    before(() => {
      cy.apiSetPhasePermission({
        phaseId,
        permissionBody: {
          permitted_by: 'users',
          require_name: false,
          require_password: false,
          require_verification: true,
        },
        action: 'posting_idea',
      });
    });

    it('works when signing up with new email', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      signUpEmailConformation(cy);

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      cy.get('#e2e-success-continue-button').click();

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });

  describe('Requires name but not password', () => {
    before(() => {
      cy.apiSetPhasePermission({
        phaseId,
        permissionBody: {
          permitted_by: 'users',
          require_name: true,
          require_password: false,
          require_verification: true,
        },
        action: 'posting_idea',
      });
    });

    it('works when signing up with new email', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      signUpEmailConformation(cy);
      cy.get('#firstName').type(randomString());
      cy.get('#lastName').type(randomString());

      cy.get('#e2e-built-in-fields-submit-button > button').click({
        force: true,
      });

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      cy.get('#e2e-success-continue-button').click();

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });
});

describe('Sign up - verification required (SSO)', () => {
  let projectId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.apiSetPhasePermission({
          phaseId,
          permissionBody: {
            permitted_by: 'users',
            require_verification: true,
          },
          action: 'posting_idea',
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    fakeSSOAuth(cy, 'john_doe');

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  });

  describe('Does not require name and password', () => {
    before(() => {
      cy.apiSetPhasePermission({
        phaseId,
        permissionBody: {
          permitted_by: 'users',
          require_name: false,
          require_password: false,
          require_verification: true,
        },
        action: 'posting_idea',
      });
    });

    it('works when signing up with new email', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      fakeSSOAuth(cy, 'john_doe');

      cy.get('#e2e-success-continue-button').click();

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });

  describe('Requires name but not password', () => {
    before(() => {
      cy.apiSetPhasePermission({
        phaseId,
        permissionBody: {
          permitted_by: 'users',
          require_name: true,
          require_password: false,
          require_verification: true,
        },
        action: 'posting_idea',
      });
    });

    it('works when signing up with new email', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      fakeSSOAuth(cy, 'john_doe');

      cy.get('#e2e-success-continue-button').click();

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });
});
