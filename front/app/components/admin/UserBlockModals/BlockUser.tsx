import React, { useState } from 'react';

import {
  Button,
  Text,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBlockUser from 'api/blocked_users/useBlockUser';
import { IUserData } from 'api/users/types';

import TextArea from 'components/HookForm/TextArea';
import { FormLabel } from 'components/UI/FormComponents';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { getFullName } from 'utils/textUtils';

import messages from './messages';
import SuccessfulUserBlock from './SuccessfulUserBlock';

type Props = {
  setClose: () => void;
  user: IUserData;
  /**
   * Optional ref to return focus on close.
   * By default, focus returns to the control that opened the modal.
   * Use this ref if you want to return focus to another ref.
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
};

type FormValues = {
  reason: string;
};

const BlockUserModal = ({ setClose, user, returnFocusRef }: Props) => {
  const [success, setSuccess] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<IUserData | undefined>();
  const { data: appConfiguration } = useAppConfiguration();

  const { mutate: blockUser } = useBlockUser();

  const schema = object({
    reason: string().required(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {},
    resolver: yupResolver(schema),
  });

  const { formatMessage } = useIntl();

  const onFormSubmit = ({ reason }: FormValues) => {
    blockUser(
      { userId: user.id, reason },
      {
        onSuccess: (response) => {
          setUpdatedUser(response.data);
          setSuccess(true);
        },
        onError: (error) => {
          handleHookFormSubmissionError(error, methods.setError);
        },
      }
    );
  };

  const blockingDuration =
    (appConfiguration &&
      appConfiguration.data.attributes.settings.user_blocking?.duration) ||
    90;

  if (success && updatedUser) {
    return (
      <SuccessfulUserBlock
        name={getFullName(user)}
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        date={moment(updatedUser?.attributes.block_end_at).format('LL')}
        resetSuccess={() => setSuccess(false)}
        setClose={setClose}
        opened={true}
      />
    );
  }

  return (
    <Modal
      close={setClose}
      opened={true}
      header={formatMessage(messages.header)}
      returnFocusRef={returnFocusRef}
    >
      <Box p="30px">
        <FormProvider {...methods}>
          <form>
            <Text mt="0" color="textSecondary">
              <FormattedMessage
                {...messages.subtitle}
                values={{
                  daysBlocked: (
                    <b>
                      {formatMessage(messages.daysBlocked, {
                        numberOfDays: blockingDuration,
                      })}
                    </b>
                  ),
                }}
              />
            </Text>
            <FormLabel
              display="flex"
              alignItems="flex-start"
              labelMessage={messages.reasonLabel}
              htmlFor="reason"
              optional
            >
              <IconTooltip
                marginLeft="5px"
                icon="info-solid"
                content={formatMessage(messages.reasonLabelTooltip)}
              />
            </FormLabel>
            <TextArea name="reason" />
            <Box m="30px 0">
              <Warning>{formatMessage(messages.blockInfo)}</Warning>
            </Box>
            <Box display="flex">
              <Button
                onClick={methods.handleSubmit(onFormSubmit)}
                processing={methods.formState.isSubmitting}
              >
                {formatMessage(messages.blockAction)}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default BlockUserModal;
