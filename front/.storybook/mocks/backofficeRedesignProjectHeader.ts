// Storybook-only data for the stories of the redesigned project header
// (backofficeRedesign/Header): the people with access to a project and an
// app configuration with the preview link feature on.
import { http, HttpResponse } from 'msw';

import { getAppConfigurationData } from '../../app/api/app_configuration/__mocks__/_mockServer';
import { mockAuthUserData } from '../../app/api/me/__mocks__/_mockServer';
import { IUserData } from '../../app/api/users/types';
import { usersData } from '../../app/api/users/__mocks__/_mockServer';

const API = '/web_api/v1';

const person = (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  admin = false
): IUserData => ({
  ...usersData[0],
  id,
  attributes: {
    ...usersData[0].attributes,
    first_name: firstName,
    last_name: lastName,
    email,
    roles: admin ? [{ type: 'admin' }] : [],
    highest_role: admin ? 'admin' : 'project_moderator',
  },
});

// The signed-in admin, another admin, two project managers and a pending
// invite.
export const pendingInvite: IUserData = {
  ...person('bo-user-pending', '', '', 'sam.peeters@example.org'),
  attributes: {
    ...person('bo-user-pending', '', '', 'sam.peeters@example.org').attributes,
    invite_status: 'pending',
  },
};

export const projectManager = person(
  'bo-user-manager-1',
  'Lotte',
  'Janssens',
  'lotte.janssens@example.org'
);

export const otherAdmin = person(
  'bo-user-admin-2',
  'Jordan',
  'Schimmel',
  'jordan@example.org',
  true
);

export const peopleWithAccess: IUserData[] = [
  mockAuthUserData,
  otherAdmin,
  projectManager,
  person('bo-user-manager-2', 'Youssef', 'El Amrani', 'youssef@example.org'),
  pendingInvite,
];

export const moderatorsHandler = http.get(
  `${API}/projects/:projectId/moderators`,
  () => HttpResponse.json({ data: peopleWithAccess })
);

const appConfigurationWithPreviewLink = (() => {
  const data = getAppConfigurationData();
  return {
    ...data,
    attributes: {
      ...data.attributes,
      settings: {
        ...data.attributes.settings,
        project_preview_link: { allowed: true, enabled: true },
      },
    },
  };
})();

export const previewLinkEnabledHandler = http.get(
  `${API}/app_configuration`,
  () => HttpResponse.json({ data: appConfigurationWithPreviewLink })
);
