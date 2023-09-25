import React from 'react';
import { DEFAULT_VALUES, getSchema, FormValues } from './form';
import { useIntl } from 'utils/cl-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Input from 'components/HookForm/Input';
import Button from 'components/UI/Button';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { SetError } from 'containers/Authentication/typings';
import { yupResolver } from '@hookform/resolvers/yup';
import sharedMessages from '../messages';
import { isNilOrError } from 'utils/helperUtils';
import signOut from 'api/authentication/sign_in_out/signOut';
import TextButton from '../_components/TextButton';
import useMenuMessages from 'containers/MainHeader/UserMenu/messages';
import useAuthUser from 'api/me/useAuthUser';

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

const ClaveUnicaEmail = ({ loading, setError, onSubmit }: Props) => {
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

export default ClaveUnicaEmail;
