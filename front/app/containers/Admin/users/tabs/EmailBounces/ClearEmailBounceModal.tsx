import React from 'react';

import { Title, Text, Button } from '@citizenlab/cl2-component-library';

import useClearEmailBounce from 'api/email_bounced_users/useClearEmailBounce';
import { IUserData } from 'api/users/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  user: IUserData;
  email: string;
  bouncedAt: string;
  setClose: () => void;
};

const ClearEmailBounceModal = ({ user, email, bouncedAt, setClose }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const { mutate: clearEmailBounce, isPending } = useClearEmailBounce();
  const { email_bounce_reason } = user.attributes;

  const handleClear = () => {
    clearEmailBounce(user.id, { onSuccess: setClose });
  };

  return (
    <Modal
      width={500}
      close={setClose}
      opened={true}
      ariaLabelledBy="clear-email-bounce-modal-title"
    >
      <Title id="clear-email-bounce-modal-title" variant="h3" m="35px 0 20px">
        {formatMessage(messages.clearEmailBounceTitle, { email })}
      </Title>
      <Text>
        {formatMessage(messages.clearEmailBounceBouncedOn, {
          date: formatDate(bouncedAt, { dateStyle: 'long' }),
        })}
      </Text>
      {email_bounce_reason && (
        <Text color="textSecondary">
          {formatMessage(messages.clearEmailBounceReason, {
            reason: email_bounce_reason,
          })}
        </Text>
      )}
      <Text mb="24px">{formatMessage(messages.clearEmailBounceWarning)}</Text>
      <Button
        mb="20px"
        buttonStyle="delete"
        data-testid="clearEmailBounceBtn"
        onClick={handleClear}
        processing={isPending}
      >
        {formatMessage(messages.clearEmailBounce)}
      </Button>
      <Button buttonStyle="secondary-outlined" onClick={setClose}>
        {formatMessage(messages.clearEmailBounceCancel)}
      </Button>
    </Modal>
  );
};

export default ClearEmailBounceModal;
