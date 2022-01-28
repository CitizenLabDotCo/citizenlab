import React, { FormEvent, useCallback } from 'react';

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
  border: 1px;
`;

const ViennaSamlButton = ({ onClick }: Props & InjectedIntlProps) => {
  return <LoginButton onClick={onClick}>Login via StandardPortal</LoginButton>;
};

export default injectIntl(ViennaSamlButton);
