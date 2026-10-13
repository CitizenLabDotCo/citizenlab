import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useEmailInviteForm from './useEmailInviteForm';

interface Props {
  onSubmit: (email: string) => Promise<void>;
}

const EmailForm = ({ onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const { methods, submit } = useEmailInviteForm(onSubmit);

  const loading = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit}>
        <Box display="flex" alignItems="center">
          <Box width="500px">
            <Input
              name="email"
              type="email"
              autocomplete="email"
              placeholder={formatMessage(messages.typeEmailToInviteManager)}
            />
          </Box>
          <ButtonWithLink
            type="submit"
            width="auto"
            disabled={loading || !methods.formState.isValid}
            processing={loading}
            icon="email"
            buttonStyle="admin-dark"
            ml="20px"
          >
            {formatMessage(messages.invite)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailForm;
