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
