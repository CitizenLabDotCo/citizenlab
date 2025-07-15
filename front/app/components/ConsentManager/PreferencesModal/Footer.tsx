import React, { FormEvent } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

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
      <Button
        mr="4px"
        onClick={handleCancel}
        className="integration-cancel"
        buttonStyle="text"
      >
        <FormattedMessage {...messages.cancel} />
      </Button>
      <Button
        onClick={handleSave}
        buttonStyle="primary"
        className="integration-save"
        id="e2e-preferences-save"
      >
        <FormattedMessage {...messages.save} />
      </Button>
    </ButtonContainer>
  ) : (
    <Button onClick={handleCancel} buttonStyle="primary">
      <FormattedMessage {...messages.close} />
    </Button>
  );
};

export default Footer;
