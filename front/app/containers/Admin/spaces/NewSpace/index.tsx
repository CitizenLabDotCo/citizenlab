import React from 'react';

import {
  Box,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import SpaceNameForm from '../_shared/SpaceNameForm';

import messages from './messages';

const goBack = () => {
  clHistory.goBack();
};

const NewSpace = () => {
  return (
    <Box px="92px" py="84px">
      <GoBackButton onClick={goBack} />
      <Box
        bgColor={colors.white}
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        mt="20px"
        px="52px"
        py="44px"
      >
        <Title variant="h2" as="h1" color="primary" mt="0px">
          <FormattedMessage {...messages.createANewSpace} />
        </Title>
        <Box mt="80px">
          <SpaceNameForm />
        </Box>
      </Box>
    </Box>
  );
};

export default NewSpace;
