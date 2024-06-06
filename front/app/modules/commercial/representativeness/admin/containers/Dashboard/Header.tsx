import React from 'react';

import {
  Title,
  Box,
  Text,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const StyledStatusLabel = styled(StatusLabel)`
  margin-left: 8px;
  transform: translateY(-5px);
  height: 22px;
  font-weight: 700;
`;

const Header = () => (
  <Box mb="36px">
    <Title color="primary" styleVariant="h1">
      <FormattedMessage {...messages.pageTitle} />
      <StyledStatusLabel
        text={<FormattedMessage {...messages.betaLabel} />}
        backgroundColor={colors.textSecondary}
      />
    </Title>
    <Box>
      <Text color="textSecondary">
        {/* <FormattedMessage
          {...messages.pageDescription}
          values={{
            representativenessArticleLink: <RepresentativenessArticleLink />,
          }}
        /> */}
        <FormattedMessage {...messages.pageDescriptionTemporary} />
      </Text>
    </Box>
  </Box>
);

export default Header;
