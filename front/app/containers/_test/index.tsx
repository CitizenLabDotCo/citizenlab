import React, { useState } from 'react';

// api
import apiPost from './apiPost';

// hook form
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// utils
import { isCLErrorsJSON, handleCLErrorsJSON } from 'utils/errorUtils';

const DEFAULT_VALUES = {
  first_name: undefined,
  last_name: undefined,
  password: undefined,
};

const SCHEMA = yupResolver(
  object({
    first_name: string().required(),
    last_name: string().required(),
    password: string().required(),
  })
);

const Test = () => {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: SCHEMA,
  });

  const handleSubmit = async ({ first_name, last_name, password }) => {
    try {
      await apiPost({
        first_name,
        last_name,
        password,
      });
    } catch (e) {
      if (isCLErrorsJSON(e)) {
        handleCLErrorsJSON(e, methods.setError);
      } else {
        setGeneralError('General error');
      }
    }
  };

  const loading = methods.formState.isSubmitting;

  return (
    <Box p="32px" w="600px">
      {generalError && (
        <Box mb="24px">
          <Error text={generalError} />
        </Box>
      )}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box id="e2e-firstName-container">
            <Input
              name="first_name"
              id="firstName"
              type="text"
              autocomplete="given-name"
              label={'First name'}
            />
          </Box>
          <Box id="e2e-lastName-container" mt="16px">
            <Input
              name="last_name"
              id="lastName"
              type="text"
              autocomplete="family-name"
              label={'Last name'}
            />
          </Box>
          <Box id="e2e-password-container" mt="16px">
            <PasswordInput
              name="password"
              id="password"
              label={'Password'}
              autocomplete="current-password"
            />
          </Box>
          <Box w="100%" display="flex" mt="24px">
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-built-in-fields-submit-button"
            >
              Submit
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default Test;
