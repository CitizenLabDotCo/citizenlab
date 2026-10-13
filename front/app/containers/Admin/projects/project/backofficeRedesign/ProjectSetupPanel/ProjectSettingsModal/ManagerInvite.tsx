import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';

import messages from 'components/admin/AddModerator/AddByEmail/messages';
import useEmailInviteForm from 'components/admin/AddModerator/AddByEmail/useEmailInviteForm';
import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';

import { MANAGER_ACTION_MIN_WIDTH } from './constants';

interface Props {
  onInvite: (email: string) => Promise<void>;
}

const ManagerInvite = ({ onInvite }: Props) => {
  const { formatMessage } = useIntl();
  const { methods, submit } = useEmailInviteForm(onInvite);

  const { isSubmitting } = methods.formState;

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit}>
        <Box display="flex" alignItems="flex-start" gap="8px">
          <Box flex="1" minWidth="0">
            <Input
              variant="bo"
              name="email"
              type="email"
              autocomplete="email"
              ariaLabel={formatMessage(messages.typeEmailToInviteManager)}
              placeholder={formatMessage(messages.typeEmailToInviteManager)}
            />
          </Box>
          <Button
            type="submit"
            buttonStyle="bo-secondary"
            width="auto"
            minWidth={MANAGER_ACTION_MIN_WIDTH}
            disabled={isSubmitting}
            processing={isSubmitting}
          >
            {formatMessage(messages.invite)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default ManagerInvite;
