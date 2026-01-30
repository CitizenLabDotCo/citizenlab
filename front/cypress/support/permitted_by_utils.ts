export const updatePermission = (
  cy: any,
  {
    adminJwt,
    phaseId,
    permitted_by,
    user_fields_in_form,
    user_data_collection,
  }: {
    adminJwt: string;
    phaseId: string;
    permitted_by?: string;
    user_fields_in_form?: boolean;
    user_data_collection?: string;
  }
) => {
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

export const confirmUserCustomFieldHasValue = (
  cy: any,
  { key, value }: { key: string; value?: string }
) => {
  cy.intercept('GET', `/web_api/v1/users/me`).as('getMe');
  cy.visit('/');
  cy.wait('@getMe').then((interception: any) => {
    expect(interception.response?.statusCode).to.equal(200);
    expect(
      interception.response?.body.data.attributes.custom_field_values[key]
    ).to.eq(value);
  });
};
