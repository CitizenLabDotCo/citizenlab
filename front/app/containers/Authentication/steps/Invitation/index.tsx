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

// errors
import { isCLErrorsIsh, handleCLErrorsIsh } from 'utils/errorUtils';

// typings
import { SetError, Status } from 'containers/Authentication/typings';

interface FormValues {
  token: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  token: undefined,
};

interface Props {
  status: Status;
  setError: SetError;
  onSubmit: (token: string) => void;
}

const Invitation = ({ status, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    token: string().required(formatMessage(messages.pleaseEnterAToken)),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = async ({ token }: FormValues) => {
    try {
      await onSubmit(token);
    } catch (e) {
      if (isCLErrorsIsh(e)) {
        handleCLErrorsIsh(e, methods.setError);
        return;
      }

      // this error always says that your code
      // has 'expired' or 'been used already' even
      // when it's just a wrong code. we can consider
      // adding more fine-grained error messages in the future
      setError('invitation_error');
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
