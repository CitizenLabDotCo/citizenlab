import React, { FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { CategorizedDestinations } from '../typings';

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
  categorizedDestinations: CategorizedDestinations;
}

type FormMode = 'preferenceForm' | 'noDestinations';

const Footer = ({
  handleCancel,
  handleSave,
  categorizedDestinations,
}: Props) => {
  const noDestinations = Object.values(categorizedDestinations).every(
    (array) => array.length === 0
  );
  const mode: FormMode = noDestinations ? 'noDestinations' : 'preferenceForm';

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
