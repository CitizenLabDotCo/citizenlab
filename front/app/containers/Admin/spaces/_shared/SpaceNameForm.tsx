import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../NewSpace/messages';

interface FormValues {
  spaceName: Multiloc;
}

const DEFAULT_VALUES: FormValues = {
  spaceName: {},
};

const SpaceNameForm = () => {
  const { formatMessage } = useIntl();

  const schema = object({
    spaceName: validateMultiloc(formatMessage(messages.missingNameLocaleError)),
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
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box w="448px">
            <InputMultilocWithLocaleSwitcher
              name="spaceName"
              label={
                <>
                  <Text my="0px" color="textSecondary">
                    {formatMessage(messages.spaceName)}
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
          {formatMessage(messages.save)}
        </Button>
      </FormProvider>
    </Box>
  );
};

export default SpaceNameForm;
