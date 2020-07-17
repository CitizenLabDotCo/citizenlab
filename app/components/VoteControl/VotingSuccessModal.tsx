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
  Header,
  Background,
  Foreground,
  ForegroundIconContainer,
  ForegroundIcon,
  Title,
  ButtonContainer,
} from './modalStyles';
import { colors } from 'utils/styleUtils';

// svg
import illustration from 'components/Verification/illustration.svg';

interface Props {
  opened: boolean;
  onClose: () => void;
  className?: string;
}

export default memo<Props>(({ opened, onClose, className }) => {
  return (
    <Modal width={600} opened={opened} close={onClose}>
      <Container className={`e2e-programmtic-vote-success-modal ${className}`}>
        <Header>
          <Background src={illustration} alt="" role="presentation" />
          <Foreground>
            <ForegroundIconContainer>
              <ForegroundIcon
                name="checkmark-full"
                color={colors.clGreenSuccess}
              />
            </ForegroundIconContainer>
          </Foreground>
        </Header>

        <Title color={colors.clGreenSuccess}>
          <FormattedMessage {...messages.voteSuccessTitle} />
        </Title>

        <ButtonContainer>
          <Button onClick={onClose} buttonStyle="secondary">
            <FormattedMessage {...messages.close} />
          </Button>
        </ButtonContainer>
      </Container>
    </Modal>
  );
});
