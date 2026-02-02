import moment = require('moment');
import { randomString } from './commands';
import { ParticipationMethod } from '../../app/api/phases/types';

const withAdminJwt = (
  makeRequest: (adminJwt: string) => any,
  adminJwt?: string
) => {
  if (adminJwt) return makeRequest(adminJwt);

  return cy
    .apiLogin('admin@govocal.com', 'democracy2.0')
    .then((response: any) => {
      const adminJwt = response.body.jwt;
      return makeRequest(adminJwt);
    });
};

export const setupProject = ({
  participationMethod,
}: {
  participationMethod: ParticipationMethod;
}) => {
  let customFieldId: string;
  let customFieldKey: string;
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  const fieldName = randomString();

  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  // Create custom field
  return cy
    .apiCreateCustomField(fieldName, true, false)
    .then((response) => {
      customFieldId = response.body.data.id;
      customFieldKey = response.body.data.attributes.key;

      return cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      });
    })
    .then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      return cy.apiCreatePhase({
        projectId,
        title: randomString(),
        startAt: twoDaysAgo,
        endAt: inTwoMonths,
        participationMethod,
        canComment: true,
        canPost: true,
        canReact: true,
        description: 'Some description',
        allow_anonymous_participation: true,
      });
    })
    .then((phaseResponse) => {
      phaseId = phaseResponse.body.data.id;
      return {
        customFieldId,
        customFieldKey,
        projectId,
        projectSlug,
        phaseId,
        fieldName,
      };
    });
};

export const updatePermission = ({
  adminJwt,
  phaseId,
  permitted_by,
  user_fields_in_form,
  user_data_collection,
}: {
  adminJwt?: string;
  phaseId: string;
  permitted_by?: string;
  user_fields_in_form?: boolean;
  user_data_collection?: string;
}) => {
  const makeRequest = (adminJwt: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/phases/${phaseId}/permissions/posting_idea`,
      body: {
        permitted_by,
        user_fields_in_form,
        user_data_collection,
      },
    });
  };

  return withAdminJwt(makeRequest, adminJwt);
};

export const addPermissionsCustomField = ({
  adminJwt,
  phaseId,
  customFieldId,
}: {
  adminJwt?: string;
  phaseId: string;
  customFieldId: string;
}) => {
  const makeRequest = (adminJwt: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: `web_api/v1/phases/${phaseId}/permissions/posting_idea/permissions_custom_fields`,
      body: {
        custom_field_id: customFieldId,
        required: true,
      },
    });
  };

  return withAdminJwt(makeRequest, adminJwt);
};

export const confirmUserCustomFieldHasValue = ({
  key,
  value,
}: {
  key: string;
  value?: string;
}) => {
  cy.intercept('GET', `/web_api/v1/users/me`).as('getMe');
  cy.visit('/');
  cy.wait('@getMe').then((interception: any) => {
    expect(interception.response?.statusCode).to.equal(200);
    expect(
      interception.response?.body.data.attributes.custom_field_values[key]
    ).to.eq(value);
  });
};
