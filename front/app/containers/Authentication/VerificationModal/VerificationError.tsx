import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Icon, Title } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { IVerificationError } from 'events/verificationModal';

// Types
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  fill: ${colors.red600};
  margin-bottom: 30px;
`;

const Subtitle = styled.p`
  width: 100%;
  max-width: 500px;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 300;
  margin: 0;
  padding: 0;
`;

interface Props {
  className?: string;
  error: IVerificationError;
}

const VerificationError = ({ className, error }: Props) => {
  let message = messages.errorGenericSubtitle;

  if (error) {
    if (error === 'taken') {
      message = messages.errorTakenSubtitle;
    } else if (error === 'not_entitled') {
      message = messages.errorNotEntitledSubtitle;
    }
  }

  return (
    <Container id="e2e-verification-errror" className={className}>
      <StyledIcon name="alert-circle" fill={colors.error} />
      <Title className="e2e-user-verified-errror-modal-content">
        <strong>
          <FormattedMessage {...messages.errorTitle} />
        </strong>
      </Title>
      <Subtitle>
        <FormattedMessage {...message} />
      </Subtitle>
    </Container>
  );
};

export default VerificationError;
