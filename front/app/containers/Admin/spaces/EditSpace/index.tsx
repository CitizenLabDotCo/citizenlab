import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';

import clHistory from 'utils/cl-router/history';

import { TEST_NODE_DATA } from './fakeData';
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
        <TreeView nodes={TEST_NODE_DATA} />
      </Box>
    </Box>
  );
};

export default EditSpace;
