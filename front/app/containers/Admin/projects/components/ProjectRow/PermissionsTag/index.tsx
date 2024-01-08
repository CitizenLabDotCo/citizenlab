import React from 'react';
import { colors, StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import styled from 'styled-components';

const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const PermissionsTag = ({ groupCount }: { groupCount: number }) => (
  <StyledStatusLabel
    text={
      groupCount > 0 ? (
        <FormattedMessage
          {...messages.xGroupsHaveAccess}
          values={{ groupCount }}
        />
      ) : (
        <FormattedMessage {...messages.onlyAdminsCanView} />
      )
    }
    backgroundColor={colors.teal}
    icon="lock"
  />
);

export default PermissionsTag;
