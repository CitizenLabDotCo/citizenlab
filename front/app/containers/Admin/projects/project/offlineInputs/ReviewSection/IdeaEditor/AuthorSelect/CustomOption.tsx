import React, { useMemo } from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// utils
import { optionIsUser } from 'components/UI/UserSelect/utils';
import { isValidEmail } from 'utils/validate';

// typings
import { Option } from 'components/UI/UserSelect/typings';

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
  data: Option;
  options: Option[];
}

const CustomOption = ({ children, innerProps, data, options }: Props) => {
  const emailAddresses = useMemo(() => {
    const emailAddressesSet = new Set<string>();

    options.forEach((option) => {
      if (optionIsUser(option) && option.attributes.email) {
        emailAddressesSet.add(option.attributes.email);
      }
    });

    return emailAddressesSet;
  }, [options]);

  if (!optionIsUser(data) && data.value === 'newUser') {
    const email = data.payload;
    if (email === undefined) return null;

    const existingUser = emailAddresses.has(email);
    if (existingUser) return null;

    const invalidEmail = !isValidEmail(email);

    return (
      <NewUserButton {...innerProps} disabled={invalidEmail}>
        {invalidEmail ? (
          <b>Invalid email</b>
        ) : (
          <>
            <Icon
              display="inline"
              name="plus-circle"
              width={`${fontSizes.l}px`}
              height={`${fontSizes.l}px`}
              fill={colors.success}
              mr="4px"
              transform="translate(0,-1)"
            />
            Add new user
          </>
        )}
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
