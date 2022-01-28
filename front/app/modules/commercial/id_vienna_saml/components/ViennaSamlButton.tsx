import React, { FormEvent, useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
// import messages from '../messages';
import styled from 'styled-components';

interface Props {
  onClick: (event: FormEvent) => void;
}

const LoginButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ViennaSamlButton = ({}: Props & InjectedIntlProps) => {
  const handleOnClick = useCallback(() => {
    window.location.href = `${AUTH_PATH}/saml`;
  }, []);

  return (
    <LoginButton onClick={handleOnClick}>Login via StandardPortal</LoginButton>
  );
};

export default injectIntl(ViennaSamlButton);
