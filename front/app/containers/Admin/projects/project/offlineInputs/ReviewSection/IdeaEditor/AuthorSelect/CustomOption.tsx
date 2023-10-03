import React from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// utils
import { optionIsUser } from 'components/UI/UserSelect/utils';
import { isValidEmail } from 'utils/validate';

// typings
import { IUserData } from 'api/users/types';

const NewUserButton = styled.button<{ disabled: boolean }>`
  background-color: ${colors.successLight};
  padding: 8px 4px;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: ${colors.grey200};
  }

  ${({ disabled }) =>
    disabled
      ? `
    background-color: ${colors.grey100};
    color: ${colors.grey800};
    cursor: not-allowed;
  `
      : ''}
`;

const UserRow = styled(Box)`
  &:hover {
    background-color: ${colors.grey200};
  }
`;

interface Props {
  children: React.ReactNode;
  innerProps: any;
  data: IUserData | { value: string; payload?: string };
}

const CustomOption = ({ children, innerProps, data }: Props) => {
  if (!optionIsUser(data) && data.value === 'newUser') {
    const invalidEmail =
      data.payload !== undefined ? !isValidEmail(data.payload) : false;

    return (
      <NewUserButton {...innerProps} disabled={invalidEmail}>
        <Icon
          display="inline"
          name="plus-circle"
          width={`${fontSizes.l}px`}
          height={`${fontSizes.l}px`}
          fill={invalidEmail ? colors.grey700 : colors.success}
          mr="4px"
          transform="translate(0,-1)"
        />
        Add new user {invalidEmail ? <b>(invalid email)</b> : ''}
      </NewUserButton>
    );
  }

  return (
    <UserRow {...innerProps} p="8px 4px">
      {children}
    </UserRow>
  );
};

export default CustomOption;
