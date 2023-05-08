import React from 'react';
import { DEFAULT_VALUES, getSchema, FormValues } from './form';
import { useIntl } from 'utils/cl-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Input from 'components/HookForm/Input';
import Button from 'components/UI/Button';
import { isCLErrorsIsh, handleCLErrorsIsh } from 'utils/errorUtils';
import { SetError } from 'containers/Authentication/typings';
import { yupResolver } from '@hookform/resolvers/yup';
import sharedMessages from '../messages';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (userId: string, email: string) => void;
}

const ClaveUnicaEmail = ({ loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  const schema = getSchema(formatMessage);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(authUser)) return null;

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit(authUser.id, email);
    } catch (e) {
      if (isCLErrorsIsh(e)) {
        handleCLErrorsIsh(e, methods.setError);
        return;
      }

      setError('account_creation_failed');
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
    </>
  );
};

export default ClaveUnicaEmail;
