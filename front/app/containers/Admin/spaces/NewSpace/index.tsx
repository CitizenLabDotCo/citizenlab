import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import { SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

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
        <SectionTitle>
          <FormattedMessage {...messages.createANewSpace} />
        </SectionTitle>
      </Box>
    </Box>
  );
};

export default NewSpace;
