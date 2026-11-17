import React from 'react';

import { colors, Td, Text, Tr } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';
import { IVolunteerData } from 'api/volunteers/types';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

const cellProps = {
  py: '8px',
  borderBottom: `1px solid ${colors.divider}`,
};

interface Props {
  volunteer: IVolunteerData;
  user: IUserData | undefined;
  causeTitle: string | undefined;
}

const VolunteerRow = ({ volunteer, user, causeTitle }: Props) => {
  const { formatDate } = useIntl();

  return (
    <Tr>
      <Td {...cellProps}>
        <Text variant="boControl" as="span" m="0">
          {user && getFullName(user)}
        </Text>
      </Td>
      <Td {...cellProps}>
        <Text variant="boControl" color="coolGrey600" as="span" m="0">
          {user?.attributes.email}
        </Text>
      </Td>
      <Td {...cellProps}>
        <Text variant="boControl" as="span" m="0">
          {causeTitle}
        </Text>
      </Td>
      <Td {...cellProps} style={{ whiteSpace: 'nowrap' }}>
        <Text variant="boControl" color="coolGrey600" as="span" m="0">
          {formatDate(volunteer.attributes.created_at, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </Td>
    </Tr>
  );
};

export default VolunteerRow;
