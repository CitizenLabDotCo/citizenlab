import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';

import signOut from 'api/authentication/sign_in_out/signOut';
import useAuthUser from 'api/me/useAuthUser';

import { SetError } from 'containers/Authentication/typings';
import useMenuMessages from 'containers/MainHeader/Components/UserMenu/messages';

import Input from 'components/HookForm/Input';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import TextButton from '../_components/TextButton';
import sharedMessages from '../messages';

import { DEFAULT_VALUES, getSchema, FormValues } from './form';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: ({
    email,
    userId,
  }: {
    email: string;
    userId: string;
  }) => Promise<void>;
}

// Some SSO providers don't return the email (ClaveUnica, Criipto MitID). We call such providers "emailless".
const EmaillessSsoEmail = ({ loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const schema = getSchema(formatMessage);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(authUser)) return null;

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit({ email, userId: authUser.data.id });
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      if (e.email?.[0]?.error === 'taken') {
        setError('email_taken_and_user_can_be_verified');
      } else {
        setError('account_creation_failed');
      }
    }
  };
  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px" color="tenantText">
            {formatMessage(sharedMessages.enterYourEmailAddress)}
          </Text>
          <Box>
            <Input
              name="email"
              type="email"
              label={formatMessage(sharedMessages.email)}
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button
              type="submit"
              width="100%"
              disabled={loading}
              processing={loading}
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>

      <Text>
        <TextButton onClick={signOut} className="link">
          {formatMessage(useMenuMessages.signOut)}
        </TextButton>
      </Text>
    </>
  );
};

export default EmaillessSsoEmail;
