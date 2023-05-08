import React from 'react';
import { DEFAULT_VALUES, getSchema, FormValues } from './form';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Input from 'components/HookForm/Input';
import Button from 'components/UI/Button';
import { isCLErrorsIsh, handleCLErrorsIsh } from 'utils/errorUtils';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string, locale: Locale) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const ClaveUnicaEmail = ({ loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = getSchema(formatMessage);

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit({
        email,
      });
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
        <>{'Clave unica email field'}</>
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
