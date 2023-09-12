import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import Centerer from 'components/UI/Centerer';

// hooks
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// typings
import { TVerificationMethod } from 'api/verification_methods/types';
import Outlet from 'components/Outlet';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  &.inModal {
    justify-content: center;
  }

  ${media.tablet`
    flex-wrap: wrap;
  `}
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.inModal {
    padding: 28px;
    background: ${colors.background};
    border-radius: ${(props) => props.theme.borderRadius};
    max-width: 650px;

    ${media.phone`
      padding: 14px;
    `}
  }
`;

interface Props {
  onMethodSelected: (selectedMethod: TVerificationMethod) => void;
  onSkipped?: () => void;
}

const VerificationMethods = memo<Props>(({ onMethodSelected }) => {
  const { data: verificationMethods } = useVerificationMethods();

  const handleOnMethodSelected = (method: TVerificationMethod) => {
    onMethodSelected(method);
  };

  if (verificationMethods === undefined) {
    return (
      <Centerer height="250px">
        <Spinner />
      </Centerer>
    );
  }

  if (!isNilOrError(verificationMethods)) {
    return (
      <Container id="e2e-verification-wizard-method-selection-step">
        <Content className="inModal">
          <ButtonsContainer className={'inModal'}>
            <Outlet
              id="app.components.VerificationModal.buttons"
              onClick={handleOnMethodSelected}
              verificationMethods={verificationMethods.data}
            />
          </ButtonsContainer>
        </Content>
      </Container>
    );
  }

  return null;
});

export default VerificationMethods;
