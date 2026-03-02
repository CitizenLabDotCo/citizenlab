import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface FormValues {
  spaceName: string;
}

const DEFAULT_VALUES: FormValues = {
  spaceName: '',
};

const SpaceNameForm = () => {
  const schema = object({
    spaceName: string().required().min(3).max(80),
  });

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const loading = methods.formState.isSubmitting;

  const handleSubmit = () => {
    // TODO
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      mt="120px"
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box w="448px">
            <InputMultilocWithLocaleSwitcher
              name="spaceName"
              label={
                <>
                  <Text my="0px" color="textSecondary">
                    <FormattedMessage {...messages.spaceName} />
                  </Text>
                </>
              }
            />
          </Box>
        </form>
        <Button
          type="submit"
          width="auto"
          disabled={loading}
          processing={loading}
          buttonStyle="admin-dark"
          mt="16px"
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </FormProvider>
    </Box>
  );
};

export default SpaceNameForm;
