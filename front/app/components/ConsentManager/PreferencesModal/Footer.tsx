import React, { FormEvent } from 'react';

// styling
import { darken } from 'polished';
import styled from 'styled-components';

// components
import Button from 'components/UI/Button';
import { Box, colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const ButtonContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    width="100%"
    display="flex"
    alignItems="center"
    justifyContent="flex-end"
  >
    {children}
  </Box>
);

const CancelButton = styled(Button)`
  margin-right: 4px;
`;

interface Props {
  handleCancelBack: () => void;
  handleCancelConfirm: () => void;
  handleCancel: () => void;
  handleSave: (e: FormEvent<any>) => void;
  mode: 'preferenceForm' | 'noDestinations' | 'cancelling';
}

const Footer = ({
  mode,
  handleCancelBack,
  handleCancelConfirm,
  handleCancel,
  handleSave,
}: Props) => {
  return mode === 'cancelling' ? (
    <ButtonContainer>
      <CancelButton
        onClick={handleCancelBack}
        buttonStyle="primary-inverse"
        textColor={colors.primary}
        textHoverColor={colors.primary}
      >
        <FormattedMessage {...messages.back} />
      </CancelButton>
      <Button
        onClick={handleCancelConfirm}
        buttonStyle="primary"
        bgColor={colors.primary}
        bgHoverColor={darken(0.1, colors.primary)}
      >
        <FormattedMessage {...messages.confirm} />
      </Button>
    </ButtonContainer>
  ) : mode === 'preferenceForm' ? (
    <ButtonContainer>
      <CancelButton
        onClick={handleCancel}
        className="integration-cancel"
        buttonStyle="primary-inverse"
        textColor={colors.primary}
        textHoverColor={colors.primary}
      >
        <FormattedMessage {...messages.cancel} />
      </CancelButton>
      <Button
        onClick={handleSave}
        buttonStyle="primary"
        bgColor={colors.primary}
        bgHoverColor={darken(0.1, colors.primary)}
        className="integration-save"
        id="e2e-preferences-save"
      >
        <FormattedMessage {...messages.save} />
      </Button>
    </ButtonContainer>
  ) : (
    <Button
      onClick={handleCancel}
      buttonStyle="primary"
      bgColor={colors.primary}
      bgHoverColor={darken(0.1, colors.primary)}
    >
      <FormattedMessage {...messages.close} />
    </Button>
  );
};

export default Footer;
