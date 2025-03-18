import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AreaSelection from './AreaSelection';
import messages from './messages';

const ButtonWithFollowAreasModal = () => {
  const { formatMessage } = useIntl();
  const [isModalOpened, setIsModalOpened] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpened(!isModalOpened)}
        buttonStyle="text"
      >
        <FormattedMessage {...messages.followAreas} />
      </Button>
      <Modal opened={isModalOpened} close={() => setIsModalOpened(false)}>
        <AreaSelection title={formatMessage(messages.areasYouFollow)} />
      </Modal>
    </>
  );
};

export default ButtonWithFollowAreasModal;
