import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

import useSpace from 'api/spaces/useSpace';

import useLocalize from 'hooks/useLocalize';

import TabbedResource, {
  Props as TabbedResourceProps,
} from 'components/admin/TabbedResource';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const goBack = () => {
  clHistory.goBack();
};

const EditSpace = () => {
  const { spaceId } = useParams();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: space } = useSpace(spaceId);

  if (!space) return null;

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
      <GoBackButton onClick={goBack} />
      <TabbedResource {...tabbedProps}>
        <RouterOutlet />
      </TabbedResource>
    </Box>
  );
};

export default EditSpace;
