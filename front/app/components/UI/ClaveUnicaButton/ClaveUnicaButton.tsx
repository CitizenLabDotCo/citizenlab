import React from 'react';

import styled from 'styled-components';

import icon from './clave-unica-icon.svg';

// CSS extracted from the official Clave Unica button
// https://drive.google.com/file/d/1-aBGu5XEjHD1LYcqOZP_mUg4ekFLDv6v/view
// The Button component is not used to easily use the same CSS as the official button.
const ClaveUnicaButtonContainer = styled.a`
  justify-content: center;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  background-color: #0f69c4;
  color: #ffffff;
  &:hover {
    color: #ffffff;
    background-color: #0c549c;
  }
  width: 160px;
  min-width: 160px;
  height: 42px;
  padding: 8px 18px 8px 15px;
  font-size: 16px;
  line-height: 1.6em;
  user-select: none;
  border-radius: 0;
  cursor: pointer;
`;

const ButtonWrapper = styled(ClaveUnicaButtonContainer)`
  display: inline-flex;
  &.disabled {
    opacity: 0.37;
    cursor: not-allowed;
  }
`;

const ClaveUnicaButtonIcon = styled.span`
  background: url(${icon});
  display: inline-block;
  width: 24px;
  height: 24px;
  float: left;
  text-indent: -9999px;
  box-sizing: border-box;
`;

const ClaveUnicaButtonLabel = styled.span`
  padding-left: 3px;
  text-decoration: underline;
  box-sizing: border-box;
`;

const HelperText = styled.div`
  display: inline;
  margin-right: 16px;
  color: ${(props) => props.theme.colors.tenantText};
`;

interface Props {
  disabled?: boolean;
  message: string | JSX.Element;
  onClick: () => void;
}

const ClaveUnicaButton = ({ disabled, message, onClick }: Props) => {
  return (
    <div>
      {message && <HelperText>{message}</HelperText>}
      <ButtonWrapper
        onClick={disabled ? undefined : onClick}
        id="e2e-clave_unica-button"
        className={disabled ? 'disabled' : undefined}
      >
        <ClaveUnicaButtonIcon />
        {/* This text should be always like that and should not be translated
        according to the guideline https://drive.google.com/file/d/1-aBGu5XEjHD1LYcqOZP_mUg4ekFLDv6v/view */}
        <ClaveUnicaButtonLabel>Iniciar sesión</ClaveUnicaButtonLabel>
      </ButtonWrapper>
    </div>
  );
};

export default ClaveUnicaButton;
