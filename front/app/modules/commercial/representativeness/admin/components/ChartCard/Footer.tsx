import React from 'react';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

const Separator = styled.span`
  margin: 0px 4px;
`;

interface Props {
  fieldIsRequired: boolean;
}

const RequiredOrOptional = ({ fieldIsRequired }: Props) =>
  fieldIsRequired ? (
    <b>
      <FormattedMessage {...messages.required} />
    </b>
  ) : (
    <b>
      <FormattedMessage {...messages.optional} />
    </b>
  );

const Footer = ({ fieldIsRequired }: Props) => {
  return (
    <Box width="100%" p="20px 40px 32px 40px">
      <Text fontSize="s" color="adminSecondaryTextColor">
        <StyledIcon
          name="user"
          width="16px"
          height="16px"
          fill={colors.adminSecondaryTextColor}
          mr="6px"
        />
        <FormattedMessage
          {...messages.percentageUsersIncluded}
          values={{
            percentage: <b>100%</b>,
          }}
        />
        <Separator>•</Separator>
        <FormattedMessage
          {...messages.forUserRegistation}
          values={{
            requiredOrOptional: (
              <RequiredOrOptional fieldIsRequired={fieldIsRequired} />
            ),
          }}
        />
      </Text>
    </Box>
  );
};

export default Footer;
