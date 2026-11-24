import React from 'react';

import { Tr, Td, colors, Checkbox } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';

import useLocale from 'hooks/useLocale';

import ActionsMenu from 'components/admin/UsersTable/ActionsMenu';
import NameAvatarEmail from 'components/admin/UsersTable/NameAvatarEmail';
import UserRole from 'components/admin/UsersTable/UserRole';

import { timeAgo } from 'utils/dateUtils';

import RegistrationStatus from './RegistrationStatus';

const RegisteredAt = styled(Td)`
  white-space: nowrap;
`;

interface Props {
  userInRow: IUserData;
  selected: boolean;
  toggleSelect: () => void;
}

const UsersTableRow = ({ userInRow, selected, toggleSelect }: Props) => {
  const locale = useLocale();

  return (
    <>
      <Tr
        key={userInRow.id}
        background={selected ? colors.background : undefined}
        className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
      >
        <Td>
          <Checkbox checked={selected} onChange={toggleSelect} />
        </Td>
        <Td>
          <NameAvatarEmail user={userInRow} />
        </Td>
        <Td>
          <UserRole user={userInRow} />
        </Td>
        <Td>
          {userInRow.attributes.last_active_at &&
            timeAgo(Date.parse(userInRow.attributes.last_active_at), locale)}
        </Td>
        <RegisteredAt>
          <RegistrationStatus user={userInRow} />
        </RegisteredAt>

        <Td>
          <ActionsMenu user={userInRow} />
        </Td>
      </Tr>
    </>
  );
};

export default UsersTableRow;
