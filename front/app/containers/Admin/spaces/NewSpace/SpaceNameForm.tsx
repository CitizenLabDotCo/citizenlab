import React from 'react';

import { Button, Text } from '@citizenlab/cl2-component-library';
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
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <InputMultilocWithLocaleSwitcher
          name="spaceName"
          label={
            <>
              <Text my="0px" color="primary" fontWeight="bold">
                <FormattedMessage {...messages.spaceName} />
              </Text>
            </>
          }
        />
      </form>
      <Button
        type="submit"
        width="auto"
        disabled={loading}
        processing={loading}
      >
        <FormattedMessage {...messages.save} />
      </Button>
    </FormProvider>
  );
};

export default SpaceNameForm;
