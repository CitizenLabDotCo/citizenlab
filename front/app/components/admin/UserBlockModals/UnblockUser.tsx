import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Button } from '@citizenlab/cl2-component-library';

// form
import { useForm, FormProvider } from 'react-hook-form';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { IUserData, unBlockUser } from 'services/users';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';

type Props = {
  open: boolean;
  setClose: () => void;
  user: IUserData;
};

export default ({ open, setClose, user }: Props) => {
  const { formatMessage } = useIntl();
  const methods = useForm({
    mode: 'onBlur',
  });

  const handleOnClick = async () => {
    try {
      await unBlockUser(user.id);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
    setClose();
  };
  return (
    <Modal width={400} close={setClose} opened={open}>
      <FormProvider {...methods}>
        <Title variant="h3" m="35px 0 30px">
          {formatMessage(messages.confirmUnblock)}
        </Title>
        <Button mb="20px" onClick={handleOnClick}>
          {formatMessage(messages.unblockActionConfirmation)}
        </Button>
        <Button buttonStyle="secondary" onClick={setClose}>
          {formatMessage(messages.cancel)}
        </Button>
      </FormProvider>
    </Modal>
  );
};
