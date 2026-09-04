import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { object } from 'yup';

import useAuthUser from 'api/me/useAuthUser';

import { SetError, State } from 'containers/Authentication/typings';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import { getEmailSchema } from '../InviteSignUp/form';
import sharedMessages from '../messages';

interface FormValues {
  new_email: string;
}

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => Promise<void>;
}

// A minimal, email-only form for when the user has a pending new_email
// (email_action_required is confirm_new_email) but wants to enter a different
// one. It is deliberately separate from the built-in-fields step: that step is
// driven by the requirements, which here say "confirm", not "provide".
const ChangeEmail = ({ state, loading, setError, onSubmit }: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  const schema = object({
    new_email: getEmailSchema(formatMessage),
  });

  const newEmail = state.new_email ?? authUser?.data.attributes.new_email;

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: { new_email: newEmail ?? undefined },
    resolver: yupResolver(schema),
  });

  const handleSubmit = async ({ new_email }: FormValues) => {
    try {
      await onSubmit(new_email);
    } catch (e: any) {
      if (e?.errors?.new_email?.[0]?.error === 'is already taken') {
        setError('email_taken_and_user_can_be_verified');
        return;
      }

      // A `base` error belongs to no form field, so react-hook-form would record
      // it against a field that is never rendered and the user would be left
      // staring at an unchanged form. Surface it on the modal instead.
      if (e?.errors?.base) {
        setError('unknown');
        return;
      }

      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <Box id="e2e-change-email-container">
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box id="e2e-email-container">
            <Input
              name="new_email"
              id="new_email"
              type="email"
              autocomplete="email"
              label={formatMessage(sharedMessages.email)}
              required
            />
          </Box>
          <Box w="100%" display="flex" mt="24px">
            <ButtonWithLink
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-change-email-submit-button"
            >
              {formatMessage(sharedMessages.continue)}
            </ButtonWithLink>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default ChangeEmail;
