import React, { memo } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

// styling
import {
  Container,
  ForegroundIcon,
  Title,
  Subtitle,
  ButtonContainer,
} from './modalStyles';
import { colors } from 'utils/styleUtils';

interface Props {
  opened: boolean;
  onClose: () => void;
  className?: string;
}

export default memo<Props>(({ opened, onClose, className }) => {
  return (
    <Modal width={600} opened={opened} close={onClose}>
      <Container className={className}>
        <ForegroundIcon name="error" color={colors.clRedError} />

        <Title color={colors.clRedError}>
          <FormattedMessage {...messages.voteErrorTitle} />
        </Title>

        <Subtitle>
          <FormattedMessage {...messages.voteErrorSubTitle} />
        </Subtitle>

        <ButtonContainer>
          <Button onClick={onClose} buttonStyle="secondary">
            <FormattedMessage {...messages.close} />
          </Button>
        </ButtonContainer>
      </Container>
    </Modal>
  );
});
