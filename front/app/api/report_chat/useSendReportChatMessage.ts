import { SerializedNodes } from '@craftjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isObject } from 'lodash-es';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportChatKeys from './keys';
import { IReportChat } from './types';

type SendParams = {
  reportId: string;
  message: string;
  // The layout as it stands in the editor. The model revises this, so the admin
  // never has to save before asking for a change.
  craftjsJson: SerializedNodes;
};

// Adds the admin's turn and starts the model's, which runs in the background.
// The response already carries the transcript with the new turn on it.
const sendMessage = ({ reportId, message, craftjsJson }: SendParams) =>
  fetcher<IReportChat>({
    path: `/reports/${reportId}/chat`,
    action: 'post',
    body: { message, craftjs_json: craftjsJson },
  });

const useSendReportChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<IReportChat, CLErrors, SendParams>({
    mutationFn: sendMessage,
    onSuccess: (chat, { reportId }) => {
      queryClient.setQueryData(reportChatKeys.item({ reportId }), chat);
    },
    // The chat may have moved on without this panel: a turn another admin started,
    // or one this panel gave up on. Reading it again shows where it stands.
    onError: (_error, { reportId }) => {
      queryClient.invalidateQueries({
        queryKey: reportChatKeys.item({ reportId }),
      });
    },
  });
};

// The turn was refused because the model is already working on this report. The
// refreshed chat shows that as pending, so it needs no message of its own; every
// other failure does.
export const isConversationBusy = (error: unknown) =>
  isObject(error) &&
  'errors' in error &&
  isObject(error.errors) &&
  'base' in error.errors &&
  Array.isArray(error.errors.base) &&
  error.errors.base[0]?.error === 'conversation_busy';

export default useSendReportChatMessage;
