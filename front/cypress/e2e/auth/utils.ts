import { randomString } from '../../support/commands';
import moment = require('moment');
import {
  IPermissionUpdate,
  IPhasePermissionAction,
} from '../../../app/api/phase_permissions/types';

export const FAKE_SSO_ORIGIN = 'http://host.docker.internal:8081';

/**
 * Creates a published project with a single `native_survey` phase and sets a
 * permission on it. This is a very common setup in the auth e2e tests, where we
 * need a survey the user has to sign up / verify for before they can respond.
 *
 * Yields `{ projectId, phaseId }` so the caller can clean up the project
 * afterwards and (re)set the phase permission in nested `before` hooks.
 */
export const createNativeSurveyProjectWithPermission = ({
  projectTitle,
  permissionBody,
  action = 'posting_idea',
}: {
  projectTitle: string;
  permissionBody?: Partial<IPermissionUpdate>;
  action?: IPhasePermissionAction;
}) => {
  return cy
    .apiCreateProject({
      title: projectTitle,
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
    .then((project) => {
      const projectId = project.body.data.id;

      return cy
        .apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        })
        .then((phase) => {
          const phaseId = phase.body.data.id;

          return cy
            .apiSetPhasePermission({ phaseId, permissionBody, action })
            .then(() => ({ projectId, phaseId }));
        });
    });
};

// See https://github.com/CitizenLabDotCo/fake_sso/blob/main/utils/profiles.js
export type ProfileName =
  | 'john_doe'
  | 'jane_doe'
  | 'tracy_smith'
  | 'billy_fixed'
  | 'jenny_fixed'
  | 'bradley_fixed';

export type Overrides = {
  email?: string;
  sub?: string;
};

export const fakeSSOAuth = (
  cy: Cypress.Chainable,
  profileName: ProfileName,
  { email, sub }: Overrides = {}
) => {
  cy.get('#e2e-login-with-fake-sso').click();

  // Browser is now on the fake_sso authorize page.
  cy.origin(
    FAKE_SSO_ORIGIN,
    { args: { profileName, email, sub } },
    ({ profileName, email, sub }) => {
      cy.get('select#profile-select').select(profileName);
      cy.get('select#profile-select').should('have.value', profileName);
      if (email) {
        cy.get('input#email-input').clear().type(email);
      }
      if (sub) {
        cy.get('input#sub-input').clear().type(sub);
      }
      cy.get('#submit-button').click();
    }
  );

  // The back-end /auth/fake_sso/callback set the JWT cookie and redirected
  // the browser to the front-end with `sso_success=true`. The front-end
  // picks up that param and resumes the auth flow in a modal.
  cy.getCookie('cl2_jwt', { timeout: 10000 }).should('not.be.null');
  cy.location('search', { timeout: 20000 }).should(
    'include',
    'sso_success=true'
  );

  // Unfortunate that we have to do this, but cypress
  // is just super weird and slow with cookies. After
  // reloading the page the cookies are properly set and the user
  // will be logged in correctly
  cy.reload();
};
