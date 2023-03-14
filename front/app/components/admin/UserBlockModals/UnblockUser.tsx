import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Button } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { IUserData, unBlockUser } from 'services/users';

type Props = {
  open: boolean;
  setClose: () => void;
  user: IUserData;
};

export default ({ open, setClose, user }: Props) => {
  const { formatMessage } = useIntl();

  const handleOnClick = async () => {
    await unBlockUser(user.id);
    setClose();
  };
  return (
    <Modal width={400} close={setClose} opened={open}>
      <Title variant="h3" m="35px 0 30px">
        {formatMessage(messages.confirmUnblock, {
          name: `${user.attributes.first_name} ${user.attributes.last_name}`,
        })}
      </Title>
      <Button mb="20px" onClick={handleOnClick}>
        {formatMessage(messages.unblockActionConfirmation)}
      </Button>
      <Button buttonStyle="secondary" onClick={setClose}>
        {formatMessage(messages.cancel)}
      </Button>
    </Modal>
  );
};
