import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// typings
import { Status } from 'containers/Authentication/typings';

interface FormValues {
  token: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  token: undefined,
};

interface Props {
  status: Status;
  onSubmit: (token: string) => void;
}

const Invitation = ({ status, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    token: string().required(formatMessage(messages.pleaseEnterAToken)),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = ({ token }: FormValues) => {
    try {
      onSubmit(token);
    } catch (e) {
      console.log('hello from catch block');
      console.log(e);
    }
  };

  const loading = status === 'pending';

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Box>
          <Input
            name="token"
            type="text"
            label={formatMessage(messages.token)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <Button
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(sharedMessages.continue)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default Invitation;
