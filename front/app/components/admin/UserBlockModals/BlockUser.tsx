import React, { useState } from 'react';
import moment from 'moment';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import TextArea from 'components/HookForm/TextArea';
import { FormLabel } from 'components/UI/FormComponents';

// components
import Modal from 'components/UI/Modal';
import {
  Button,
  Text,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import SuccessfulUserBlock from './SuccessfulUserBlock';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { IUser, IUserData } from 'api/users/types';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import useBlockUser from 'api/blocked_users/useBlockUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

type Props = {
  open: boolean;
  setClose: () => void;
  user: IUser;
  tenant: GetAppConfigurationChildProps;
};

type FormValues = {
  reason: string;
};

const BlockUserModal = ({ open, setClose, user, tenant }: Props) => {
  const [success, setSuccess] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<IUserData | undefined>();

  const { mutate: blockUser } = useBlockUser();

  const schema = object({
    current_password: string(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      reason: '',
    },
    resolver: yupResolver(schema),
  });

  const { formatMessage } = useIntl();

  const onFormSubmit = ({ reason }: FormValues) => {
    blockUser(
      { userId: user.data.id, reason },
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
    setClose();
  };

  const blockingDuration =
    (!isNilOrError(tenant) &&
      tenant.attributes.settings.user_blocking?.duration) ||
    90;

  if (success && !isNilOrError(updatedUser)) {
    return (
      <SuccessfulUserBlock
        name={`${user.data.attributes.first_name} ${user.data.attributes.last_name}`}
        date={moment(updatedUser?.attributes.block_end_at).format('LL')}
        resetSuccess={() => setSuccess(false)}
        opened={true}
      />
    );
  }

  return (
    <Modal
      close={setClose}
      opened={open}
      header={formatMessage(messages.header)}
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

export default (InputProps) => (
  <GetAppConfiguration>
    {(tenant) => <BlockUserModal tenant={tenant} {...InputProps} />}
  </GetAppConfiguration>
);
