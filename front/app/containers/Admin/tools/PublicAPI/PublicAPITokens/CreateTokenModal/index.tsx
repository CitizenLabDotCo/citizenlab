import React, { useState } from 'react';

// form
import { object, string } from 'yup';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import {
  Box,
  Button,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import useAddApiClient from 'api/api_clients/useAddApiClient';
import { handleCLErrorsIsh } from 'utils/errorUtils';

interface FormValues {
  name: string;
}

type CreateTokenModalProps = {
  onClose: () => void;
};
const CreateTokenModal = ({ onClose }: CreateTokenModalProps) => {
  const [success, setSuccess] = useState(false);
  const [secret, setSecret] = useState<string>('');
  const [tokenIsCopied, setTokenIsCopied] = useState(false);
  const { mutateAsync: addApiToken, isLoading } = useAddApiClient();
  const { formatMessage } = useIntl();
  const schema = object({
    name: string().required(formatMessage(messages.createTokenModalError)),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      const result = await addApiToken(formValues);
      setSecret(result.data.attributes.secret);
      setSuccess(true);
    } catch (error) {
      handleCLErrorsIsh(error, methods.setError);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setTokenIsCopied(true);
  };

  return (
    <Box w="100%" m="24px auto" pr="24px">
      {!success ? (
        <>
          <Title variant="h2">{formatMessage(messages.createTokenTitle)}</Title>
          <Text>{formatMessage(messages.createTokenDescription)}</Text>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onFormSubmit)}>
              <Feedback />
              <Input
                name="name"
                label={formatMessage(messages.createTokenName)}
                type="text"
                placeholder={formatMessage(messages.createTokenNamePlaceholder)}
              />

              <Box
                display="flex"
                gap="12px"
                justifyContent="flex-end"
                mt="40px"
              >
                <Button
                  buttonStyle="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {formatMessage(messages.createTokenModalCancel)}
                </Button>
                <Button type="submit" processing={isLoading}>
                  {formatMessage(messages.createTokenButton)}
                </Button>
              </Box>
            </form>
          </FormProvider>
        </>
      ) : (
        <Box data-testid="tokenCreateSuccess">
          <Title variant="h2">
            {formatMessage(messages.createTokenModalSuccess)}
          </Title>
          <Text>
            {formatMessage(messages.createTokenModalSuccessDescription)}
          </Text>
          <Box bgColor={colors.tealLight} py="4px">
            <Text fontWeight="bold" textAlign="center">
              {secret}
            </Text>
          </Box>
          <Box display="flex" gap="12px" justifyContent="flex-end" mt="40px">
            <Button buttonStyle="secondary" onClick={onClose}>
              {formatMessage(messages.createTokenModalSuccessClose)}
            </Button>
            <Button
              buttonStyle="primary"
              onClick={copySecret}
              icon={tokenIsCopied ? 'check' : 'copy'}
            >
              {tokenIsCopied
                ? formatMessage(messages.createTokenModalSuccessCopySuccess)
                : formatMessage(messages.createTokenModalSuccessCopy)}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CreateTokenModal;
