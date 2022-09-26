import React from 'react';

// components
import {
  Title,
  Box,
  Text,
  StatusLabel,
} from '@citizenlab/cl2-component-library';
// import RepresentativenessArticleLink from '../../components/RepresentativenessArticleLink';

// i18n
import messages from './messages';
import { FormattedMessage } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledStatusLabel = styled(StatusLabel)`
  margin-left: 8px;
  transform: translateY(-5px);
  height: 22px;
  font-weight: 700;
`;

const Header = () => (
  <Box mb="36px">
    <Title variant="h1">
      <FormattedMessage {...messages.pageTitle} />
      <StyledStatusLabel
        text={<FormattedMessage {...messages.betaLabel} />}
        backgroundColor={colors.adminSecondaryTextColor}
      />
    </Title>
    <Box>
      <Text color="label">
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
