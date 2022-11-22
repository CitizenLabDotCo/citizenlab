import React from 'react';

// components
import {
  Box,
  StatusLabel,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
// import RepresentativenessArticleLink from '../../components/RepresentativenessArticleLink';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
    <Title color="primary" variant="h1">
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
