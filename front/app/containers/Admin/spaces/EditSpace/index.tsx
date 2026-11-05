import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpace from 'api/spaces/useSpace';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import TabbedResource, {
  Props as TabbedResourceProps,
} from 'components/admin/TabbedResource';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { Outlet as RouterOutlet, useParams } from 'utils/router';

import messages from './messages';

const EditSpace = () => {
  const { spaceId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: space } = useSpace(spaceId);
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { data: authUser } = useAuthUser();

  if (!space || !spacesEnabled || !authUser) return null;

  if (!isAdmin(authUser) && !isSpaceModerator(authUser, spaceId)) {
    return null;
  }

  const tabbedProps: Omit<TabbedResourceProps, 'children'> = {
    resource: {
      title: localize(space.data.attributes.title_multiloc),
    },
    tabs: [
      {
        label: formatMessage(messages.projectsAndFolders),
        url: `/admin/projects/spaces/${space.data.id}`,
        name: 'projects',
      },
      {
        label: formatMessage(messages.settings),
        url: `/admin/projects/spaces/${space.data.id}/settings`,
        name: 'settings',
      },
    ],
  };

  return (
    <Box>
      <GoBackButton to="/admin/projects" search={{ tab: 'spaces' }} />
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </Box>
  );
};

export default EditSpace;
