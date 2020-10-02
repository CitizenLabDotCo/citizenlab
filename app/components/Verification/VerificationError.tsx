import React, { memo } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Title } from './styles';
import { Icon } from 'cl2-component-library';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// Types
import { IVerificationError } from './VerificationModal';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  fill: ${colors.clRedError};
  margin-bottom: 30px;
`;

const Subtitle = styled.h2`
  width: 100%;
  max-width: 500px;
  color: ${colors.text};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;
`;

interface Props {
  className?: string;
  error: IVerificationError;
}

export default memo<Props>(({ className, error }) => {
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
      <StyledIcon name="error" />
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
});
