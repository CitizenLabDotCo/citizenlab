import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { TEST_DATA_ADDED } from './fakeData';
import messages from './messages';
import ProjectFolderSelect from './ProjectFolderSelect';
import TreeView from './TreeView';

const goBack = () => {
  clHistory.goBack();
};

const EditSpace = () => {
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
        <Title variant="h2" color="primary" mt="0px" mb="20px">
          <FormattedMessage {...messages.projectsAndFoldersAdded} />
        </Title>
        <TreeView nodes={TEST_DATA_ADDED} />
        <Title variant="h3" color="primary" mt="40px" mb="20px">
          <FormattedMessage {...messages.addProjectsAndFolders} />
        </Title>
        <ProjectFolderSelect />
      </Box>
    </Box>
  );
};

export default EditSpace;
