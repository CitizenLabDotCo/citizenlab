export const createSpace = ({ title }: { title: string }) => {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'POST',
      url: 'web_api/v1/projects',
      body: {
        space: {
          title_multiloc: {
            en: title,
            'nl-BE': title,
            'nl-NL': title,
            'fr-BE': title,
          },
        },
      },
    });
  });
};

export function createModeratorForSpace({
  firstName,
  lastName,
  email,
  password,
  spaceId,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  spaceId: string;
}) {
  return cy.apiSignup(firstName, lastName, email, password).then((response) => {
    const userId = response.body.data.id;
    return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;

      return cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'POST',
        url: `web_api/v1/projects/${spaceId}/moderators`,
        body: {
          moderator: {
            user_id: userId,
          },
        },
      });
    });
  });
}
