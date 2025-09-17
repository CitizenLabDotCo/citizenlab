import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';

describe('Native survey permission: users', () => {
  let customFieldId = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';

  const fieldName = randomString(10);

  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  before(() => {
    // Create custom field
    cy.apiCreateCustomField(fieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;

      // Create project with active native survey phase
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: twoDaysAgo,
          endAt: inTwoMonths,
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canComment: true,
          canPost: true,
          canReact: true,
          description: 'Some description',
        }).then((phase) => {
          phaseId = phase.body.data.id;

          // Add custom field as permissions_custom_field
          return cy
            .apiLogin('admin@govocal.com', 'democracy2.0')
            .then((response) => {
              const adminJwt = response.body.jwt;

              return cy.request({
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${adminJwt}`,
                },
                method: 'POST',
                url: `web_api/v1/phases/${phaseId}/permissions/posting_idea/permissions_custom_fields`,
                body: {
                  custom_field_id: customFieldId,
                  required: false,
                },
              });
            });
        });
      });
    });
  });

  const createUser = () => {
    const userFirstName = randomString(10);
    const userLastName = randomString(10);
    const userPassword = randomString(10);
    const userEmail = randomEmail();

    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        const userId = (response as any).body.data.id;
        cy.setLoginCookie(userEmail, userPassword);
      }
    );
  };

  describe('Collect all data', () => {
    beforeEach(() => {
      createUser();
    });

    it.only('Ask demographic questions in registration flow', () => {
      cy.visit(`/projects/${projectSlug}`);

      // TODO
    });

    it('Ask demographic questions in survey', () => {
      // TODO
    });
  });

  describe('Collect demographics only', () => {
    it('Ask demographic questions in registration flow', () => {
      // TODO
    });

    it('Ask demographic questions in survey', () => {
      // TODO
    });
  });

  describe('Full anonymity', () => {
    it('Ask demographic questions in registration flow', () => {
      // TODO
    });
  });
});
