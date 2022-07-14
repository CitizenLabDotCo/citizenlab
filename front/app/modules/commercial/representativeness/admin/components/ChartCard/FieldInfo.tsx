import React from 'react';

// components
import { Text, Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IncludedUsers } from '../../hooks/useReferenceData';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

const Separator = styled.span`
  margin: 0px 4px;
`;

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

interface RequiredOrOptionalProps {
  fieldIsRequired: boolean;
}

export interface Props extends RequiredOrOptionalProps {
  includedUsers: IncludedUsers;
}

const FieldInfo = ({ includedUsers, fieldIsRequired }: Props) => (
  <>
    <Text fontSize="s" color="adminSecondaryTextColor">
      <StyledIcon
        name="user"
        width="16px"
        height="16px"
        fill={colors.adminSecondaryTextColor}
        mr="6px"
      />
      <FormattedMessage
        {...messages.includedUsersMessage}
        values={{
          known: includedUsers.known,
          total: includedUsers.total,
          percentage: <b>{includedUsers.percentage}%</b>,
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
  </>
);

export default FieldInfo;
