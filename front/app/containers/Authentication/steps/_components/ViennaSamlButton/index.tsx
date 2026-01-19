import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import AuthProviderButton from 'containers/Authentication/steps/_components/AuthProviderButton';
import { AuthProvider } from 'containers/Authentication/typings';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ViennaIcon from './ViennaIcon';

const Container = styled(Box)`
  display: flex;
  gap: 12px;
`;

const TextContainer = styled(Box)`
  display: flex;
  gap: 4px;
  flex-direction: column;
`;

interface Props {
  onClick: (authProvider: AuthProvider) => void;
}

const ViennaSamlButton = ({ onClick }: Props) => {
  return (
    <Box mb="18px">
      <AuthProviderButton authProvider="id_vienna_saml" onClick={onClick}>
        <Container>
          <ViennaIcon />
          <TextContainer>
            <FormattedMessage {...messages.signInWithStandardPortal} />
          </TextContainer>
        </Container>
      </AuthProviderButton>
    </Box>
  );
};

export default ViennaSamlButton;
