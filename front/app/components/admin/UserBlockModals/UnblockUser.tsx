import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Button } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  open: boolean;
  setClose: () => void;
};

export default ({ open, setClose }: Props) => {
  const { formatMessage } = useIntl();
  const [localOpen, setLocalOpen] = useState(open);
  console.log(open);
  useState();
  return (
    <Modal width={400} close={setClose} opened={localOpen}>
      <Title variant="h3" m="35px 0 30px">
        {formatMessage(messages.confirmUnblock)}
      </Title>
      <Button mb="20px">{formatMessage(messages.unblockAction)}</Button>
      <Button buttonStyle="secondary" onClick={() => setLocalOpen(false)}>
        {formatMessage(messages.cancel)}
      </Button>
    </Modal>
  );
};
