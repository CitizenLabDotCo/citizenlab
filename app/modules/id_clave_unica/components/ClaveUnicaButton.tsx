import React, { useCallback } from 'react';
import { AUTH_PATH } from 'containers/App/constants';
import { removeUrlLocale } from 'services/locale';
import { getJwt } from 'utils/auth/jwt';

// style
import styled from 'styled-components';
import icon from './clave-unica-icon.svg';

// typings
import { IVerificationMethod } from 'services/verificationMethods';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Container = styled.div`
  margin-bottom: 15px;
  .last {
    margin-bottom: 0px;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// CSS extracted from the official Clave Unica button
const ButtonWrapper = styled.a`
  display: flex;
  justify-content: center;
  font-family: Roboto, sans-serif;
  front-weight: 400;
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
  font-size: 16;
  line-height: 1.6em;
  user-select: none;
  border-radius: 0;
  cursor: pointer;
`;

const ButtonIcon = styled.span`
  background: url(${icon});
  display: inline-block;
  width: 24px;
  height: 24px;
  float: left;
  text-indent: -9999px;
  box-sizing: border-box;
`;

const ButtonLabel = styled.span`
  padding-left: 3px;theme.
  text-decoration: underline;
  box-sizing: border-box;
`;

const HelperText = styled.div`
  color: ${(props) => props.theme.colorText};
`;

interface Props {
  method: IVerificationMethod;
  last: boolean;
}

const BosaFasButton = ({ method, last }: Props) => {

  const handleOnClick = useCallback(() => {
    const jwt = getJwt();
    window.location.href = `${AUTH_PATH}/clave_unica?token=${jwt}&pathname=${removeUrlLocale(
      window.location.pathname
    )}`;
  }, []);

  return (
    <Container
      key={method.id}
      className={last ? 'last' : ''}
    >
      <ButtonWrapper
        onClick={handleOnClick}
        id={`e2e-${method.attributes.name}-button`}
      >
        <ButtonIcon />
        <ButtonLabel>Iniciar sesión</ButtonLabel>
      </ButtonWrapper>
      <HelperText>
        <FormattedMessage {...messages.verifyClaveUnica} />
      </HelperText>
    </Container>
  );
};

export default BosaFasButton;
