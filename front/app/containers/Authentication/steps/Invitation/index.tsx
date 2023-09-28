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
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

// typings
import { SetError } from 'containers/Authentication/typings';

interface FormValues {
  token: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  token: undefined,
};

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (token: string) => void;
}

const Invitation = ({ loading, setError, onSubmit }: Props) => {
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
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      // this error always says that your code
      // has 'expired' or 'been used already' even
      // when it's just a wrong code. we can consider
      // adding more fine-grained error messages in the future
      setError('invitation_error');
    }
  };

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
            id="e2e-invite-submit-button"
          >
            {formatMessage(sharedMessages.continue)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default Invitation;
