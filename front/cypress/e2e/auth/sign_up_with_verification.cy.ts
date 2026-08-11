import { enterUserInfo, signUpEmailConformation } from '../../support/auth';
import { randomString } from '../../support/commands';
import {
  createNativeSurveyProjectWithPermission,
  createVerifiedPostalCodeSmartGroup,
  fakeSSOAuth,
} from './utils';

describe('Sign up - verification required (bogus)', () => {
  let projectId = '';
  const projectTitle = randomString();
  let phaseId: string;

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_verification: true,
      },
    }).then(({ projectId: id, phaseId: pId }) => {
      projectId = id;
      phaseId = pId;
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
  let phaseId: string;

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_verification: true,
      },
    }).then(({ projectId: id, phaseId: pId }) => {
      projectId = id;
      phaseId = pId;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('works when signing up with SSO', () => {
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

    it('works when signing up with SSO', () => {
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

    it('works when signing up with SSO', () => {
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

  describe('Does not require confirmed email', () => {
    before(() => {
      cy.apiSetPhasePermission({
        phaseId,
        permissionBody: {
          permitted_by: 'users',
          require_name: false,
          require_password: false,
          require_verification: true,
          require_confirmed_email: false,
        },
        action: 'posting_idea',
      });
    });

    it('works when signing up with SSO that does not return email', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      fakeSSOAuth(cy, 'jane_doe');

      cy.get('#e2e-success-continue-button').click();

      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectTitle}/surveys/new`
      );
    });
  });
});

describe('Sign up - verification and smart group required (SSO)', () => {
  const accessDeniedExplanation =
    'You cannot participate because you were born on the wrong side of the tracks, buddy';

  // The fake SSO returns postal code '1212' for its profiles.
  const setUpProjectForPostalCode = (
    postalCode: string,
    projectTitle: string
  ) =>
    createVerifiedPostalCodeSmartGroup(postalCode).then((smartGroupId) =>
      createNativeSurveyProjectWithPermission({
        projectTitle,
        permissionBody: {
          permission: {
            permitted_by: 'users',
            require_verification: true,
            group_ids: [smartGroupId],
            access_denied_explanation_multiloc: {
              en: accessDeniedExplanation,
            },
          },
        },
      }).then(({ projectId }) => ({ projectId, smartGroupId }))
    );

  describe('User matches the smart group', () => {
    let projectId = '';
    let smartGroupId = '';
    const projectTitle = randomString();

    before(() => {
      setUpProjectForPostalCode('1212', projectTitle).then((ids) => {
        projectId = ids.projectId;
        smartGroupId = ids.smartGroupId;
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
      cy.apiRemoveSmartGroup(smartGroupId);
    });

    it('lets you participate when signing up with SSO', () => {
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

  describe('User does not match the smart group', () => {
    let projectId = '';
    let smartGroupId = '';
    const projectTitle = randomString();

    before(() => {
      setUpProjectForPostalCode('1313', projectTitle).then((ids) => {
        projectId = ids.projectId;
        smartGroupId = ids.smartGroupId;
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
      cy.apiRemoveSmartGroup(smartGroupId);
    });

    it('shows the access denied step when signing up with SSO', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      fakeSSOAuth(cy, 'john_doe');

      cy.get('#e2e-access-denied-step')
        .should('exist')
        .and('contain', accessDeniedExplanation);

      cy.get('.e2e-modal-close-button').click();

      cy.get('.e2e-idea-button')
        .first()
        .find('button')
        .should('have.attr', 'aria-disabled', 'true');
    });
  });
});
