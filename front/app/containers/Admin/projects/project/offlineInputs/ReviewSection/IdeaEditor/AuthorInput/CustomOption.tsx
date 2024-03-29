import React, { useMemo } from 'react';

import {
  Box,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { Option } from 'components/UI/UserSelect/typings';
import { optionIsUser } from 'components/UI/UserSelect/utils';

import { useIntl } from 'utils/cl-intl';
import { isValidEmail } from 'utils/validate';

import messages from './messages';

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
  const { formatMessage } = useIntl();

  const emailAddresses = useMemo(() => {
    if (optionIsUser(data) || data.value !== 'newUser') {
      return null;
    }

    const emailAddressesSet = new Set<string>();

    options.forEach((option) => {
      if (optionIsUser(option) && option.attributes.email) {
        emailAddressesSet.add(option.attributes.email);
      }
    });

    return emailAddressesSet;
  }, [data, options]);

  if (!optionIsUser(data) && data.value === 'newUser') {
    const email = data.payload;
    if (email === undefined) return null;

    const existingUser = emailAddresses?.has(email);
    if (existingUser) return null;

    const invalidEmail = !isValidEmail(email);

    return (
      <NewUserButton {...innerProps} disabled={invalidEmail}>
        {invalidEmail ? (
          <b>{formatMessage(messages.enterAValidEmail)}</b>
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
            {formatMessage(messages.addANewUser)}
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
