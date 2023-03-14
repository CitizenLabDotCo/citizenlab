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

// styling
import styled from 'styled-components';

// services
import { IUserData, blockUser } from 'services/users';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

const Container = styled.div`
  padding: 30px;
`;

const WarningContainer = styled.div`
  margin: 30px 0;
`;

type Props = {
  open: boolean;
  setClose: () => void;
  user: IUserData;
};

type FormValues = {
  reason: string;
};

export default ({ open, setClose, user }: Props) => {
  const [success, setSuccess] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<IUserData | undefined>();

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

  const onFormSubmit = async ({ reason }: FormValues) => {
    try {
      const response = await blockUser(user.id, { reason });
      setUpdatedUser(response.data);
      setSuccess(true);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
    setClose();
  };

  if (success && !isNilOrError(updatedUser)) {
    return (
      <SuccessfulUserBlock
        name={`${user.attributes.first_name} ${user.attributes.last_name}`}
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
      <Container>
        <FormProvider {...methods}>
          <form>
            <Text mt="0" color="textSecondary">
              <FormattedMessage
                {...messages.subtitle}
                values={{
                  ninetyDays: <b>{formatMessage(messages.ninetyDays)}</b>,
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
            <WarningContainer>
              <Warning>{formatMessage(messages.blockInfo)}</Warning>
            </WarningContainer>
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
      </Container>
    </Modal>
  );
};
