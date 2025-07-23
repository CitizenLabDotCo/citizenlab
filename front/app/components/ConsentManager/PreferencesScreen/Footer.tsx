import React, { FormEvent } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import BaseFooter from '../BaseFooter';
import messages from '../messages';
import { CategorizedDestinations } from '../typings';

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

  return (
    <BaseFooter>
      {mode === 'preferenceForm' ? (
        <>
          <Button
            px="4px"
            onClick={handleCancel}
            buttonStyle="text"
            data-testid="e2e-preferences-cancel"
          >
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button
            onClick={handleSave}
            buttonStyle="primary"
            data-testid="preferences-save"
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </>
      ) : (
        <Button onClick={handleCancel} buttonStyle="primary">
          <FormattedMessage {...messages.close} />
        </Button>
      )}
    </BaseFooter>
  );
};

export default Footer;
