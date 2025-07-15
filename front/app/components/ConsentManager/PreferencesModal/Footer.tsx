import React, { FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import { FormMode } from '../Container';
import messages from '../messages';

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

const CancelButton = styled(ButtonWithLink)`
  margin-right: 4px;
`;

interface Props {
  handleCancel: () => void;
  handleSave: (e: FormEvent<any>) => void;
  mode: FormMode;
}

const Footer = ({ mode, handleCancel, handleSave }: Props) => {
  return mode === 'preferenceForm' ? (
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
      <ButtonWithLink
        onClick={handleSave}
        buttonStyle="primary"
        bgColor={colors.primary}
        bgHoverColor={darken(0.1, colors.primary)}
        className="integration-save"
        id="e2e-preferences-save"
      >
        <FormattedMessage {...messages.save} />
      </ButtonWithLink>
    </ButtonContainer>
  ) : (
    <ButtonWithLink
      onClick={handleCancel}
      buttonStyle="primary"
      bgColor={colors.primary}
      bgHoverColor={darken(0.1, colors.primary)}
    >
      <FormattedMessage {...messages.close} />
    </ButtonWithLink>
  );
};

export default Footer;
