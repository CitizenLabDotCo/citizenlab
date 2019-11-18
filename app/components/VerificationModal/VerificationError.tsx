import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';
import { Title } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

// Types
import { ContextShape } from './VerificationModal';

const illustration = require('./illustration.svg');

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Subtitle = styled.h2`
  width: 100%;
  max-width: 500px;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.base}px;
  `}
`;

const CancelButton = styled(Button)`
  margin-top: 50px;
`;

interface Props {
  className?: string;
  onBack: () => void;
  context: ContextShape;
}

export default memo<Props>(({ className, onBack, context }) => {
  const authUser = useAuthUser();

  const onCancelButtonClicked = useCallback(() => {
    onBack();
  }, []);

  if (isNilOrError(authUser)) return null;

  let message;

  console.log(context);

  if (context) {
    if (context.error === 'taken') {
      message = messages.errorTakenSubtitle;
    } else if (context.error === 'not_entitled') {
      message = messages.errorNotEntitledSubtitle;
    } else {
      message = messages.errorGenericSubtitle;
    }
  }

  return (
    <Container id="e2e-verification-success" className={className}>
      <Title className="e2e-user-verified-success-modal-content">
        <strong><FormattedMessage {...messages.errorTitle} /></strong>
      </Title>
      <Subtitle>
        <FormattedMessage {...message} />
      </Subtitle>
      <CancelButton onClick={onCancelButtonClicked} style="secondary">
        <FormattedMessage {...messages.back} />
      </CancelButton>
    </Container>
  );
});
