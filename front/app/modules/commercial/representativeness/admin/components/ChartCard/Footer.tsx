import React from 'react';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import Legend from 'components/admin/Graphs/Legend';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// data
import { GENDER_INCLUDED_USERS_PERCENTAGE } from './data';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

const Separator = styled.span`
  margin: 0px 4px;
`;

interface RequiredOrOptionalProps {
  fieldIsRequired: boolean;
}

interface Props extends RequiredOrOptionalProps {
  legendLabels: string[];
  legendColors: string[];
}

const RequiredOrOptional = ({ fieldIsRequired }: RequiredOrOptionalProps) =>
  fieldIsRequired ? (
    <b>
      <FormattedMessage {...messages.required} />
    </b>
  ) : (
    <b>
      <FormattedMessage {...messages.optional} />
    </b>
  );

const Footer = ({ fieldIsRequired, legendLabels, legendColors }: Props) => {
  return (
    <Box
      width="100%"
      p="20px 40px 32px 40px"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
    >
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
            percentage: <b>{GENDER_INCLUDED_USERS_PERCENTAGE}</b>,
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
      <Legend labels={legendLabels} colors={legendColors} />
    </Box>
  );
};

export default Footer;
