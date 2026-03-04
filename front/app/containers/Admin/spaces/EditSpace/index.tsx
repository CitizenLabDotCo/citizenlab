import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

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

  if (!spaceId) return null;

  const tabbedProps: Omit<TabbedResourceProps, 'children'> = {
    resource: {
      title: 'My space',
    },
    tabs: [
      {
        label: formatMessage(messages.projectsAndFolders),
        url: `/admin/projects/spaces/${spaceId}/projects-and-folders`,
        name: 'projects',
      },
      {
        label: formatMessage(messages.settings),
        url: `/admin/projects/spaces/${spaceId}/settings`,
        name: 'settings',
      },
    ],
  };

  return (
    <Box px="48px" py="48px">
      <GoBackButton onClick={goBack} />
      <Title variant="h1" color="primary" mt="56px" mb="40px">
        My space
      </Title>
      <Box
        bgColor={colors.white}
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        mt="20px"
        px="52px"
        py="44px"
      >
        <TabbedResource {...tabbedProps}>
          <RouterOutlet />
        </TabbedResource>
      </Box>
    </Box>
  );
};

export default EditSpace;
