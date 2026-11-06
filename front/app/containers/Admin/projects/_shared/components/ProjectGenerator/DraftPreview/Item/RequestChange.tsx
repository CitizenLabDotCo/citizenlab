import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAddAiAssistantMessage from 'api/ai_assistant_messages/useAddAiAssistantMessage';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import RefineForm from './RefineForm';

type Props = {
  conversationId: string;
  toMessage: (request: string) => string;
};

const RequestChange = ({ conversationId, toMessage }: Props) => {
  const [opened, setOpened] = useState(false);
  const { mutate: addMessage, isPending } = useAddAiAssistantMessage();

  const send = (request: string) =>
    addMessage(
      { conversationId, content: toMessage(request), fileIds: [] },
      { onSuccess: () => setOpened(false) }
    );

  if (opened) {
    return (
      <RefineForm
        sending={isPending}
        onSend={send}
        onCancel={() => setOpened(false)}
      />
    );
  }

  return (
    <Box display="flex" justifyContent="flex-end">
      <ButtonWithLink
        type="button"
        buttonStyle="bo-text"
        height="30px"
        padding="0 8px"
        icon="edit"
        onClick={() => setOpened(true)}
      >
        <FormattedMessage {...messages.refine} />
      </ButtonWithLink>
    </Box>
  );
};

export default RequestChange;
