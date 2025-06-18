import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { Title } from 'components/smallForm';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export default () => (
  <Box
    display="flex"
    maxWidth="380px"
    px="20px"
    width="100%"
    marginLeft="auto"
    marginRight="auto"
    flexDirection="column"
    mt="60px"
  >
    <Box display="flex" justifyContent="center">
      <Icon
        name="check-circle"
        fill={colors.green400}
        width="60px"
        height="60px"
      />
    </Box>
    <Title style={{ paddingTop: '26px' }}>
      <FormattedMessage {...messages.passwordChangeSuccessMessage} />
    </Title>
    <ButtonWithLink linkTo={'/'} scrollToTop>
      <FormattedMessage {...messages.goHome} />
    </ButtonWithLink>
  </Box>
);
