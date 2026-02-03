import React from 'react';

import { IconNames, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { AuthProvider } from 'containers/Authentication/typings';

import ButtonWithLink from 'components/UI/ButtonWithLink';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  background: #fff;
  transition: all 100ms ease-out;

  &:hover {
    border-color: ${darken(0.3, '#ccc')};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
  }
`;

export interface Props {
  id?: string;
  icon?: IconNames;
  authProvider: AuthProvider;
  onClick: (authProvider: AuthProvider) => void;
  children: React.ReactNode;
}

const AuthProviderButton = ({
  id,
  icon,
  authProvider,
  onClick,
  children,
}: Props) => {
  const theme = useTheme();

  const handleClick = () => {
    onClick(authProvider);
  };

  return (
    <Container id={id}>
      <ButtonWithLink
        icon={icon}
        iconSize="22px"
        iconColor={
          authProvider === 'facebook'
            ? colors.facebook
            : theme.colors.tenantText
        }
        buttonStyle="white"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        onClick={handleClick}
        padding="10px 18px"
        textColor={theme.colors.tenantText}
      >
        {children}
      </ButtonWithLink>
    </Container>
  );
};

export default AuthProviderButton;
