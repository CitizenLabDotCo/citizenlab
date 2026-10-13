import React, { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  FeedbackPromptUiVersion,
  IFeedbackPromptData,
} from 'api/feedback_prompts/types';
import useShowNextFeedbackPrompt from 'api/feedback_prompts/useShowNextFeedbackPrompt';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import PromptCard from './PromptCard';

// Asks admins and project managers short questions about how the back office
// works for them. Due prompts are decided by the back-end; we check for one
// after every successful save, which is the moment the prompts are meant for.
const FeedbackPrompt = () => {
  const queryClient = useQueryClient();
  const isBackofficeRedesign = useProjectBackofficeRedesign();
  const { mutate: showNext } = useShowNextFeedbackPrompt();
  const [prompt, setPrompt] = useState<IFeedbackPromptData | null>(null);
  const busy = useRef(false);

  const uiVersion: FeedbackPromptUiVersion = isBackofficeRedesign
    ? 'project_backoffice_v2'
    : 'project_backoffice_v1';

  useEffect(() => {
    return queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      if (event.mutation.options.meta?.feedbackPrompt) return;
      if (busy.current) return;

      busy.current = true;
      showNext(uiVersion, {
        onSuccess: (response) => {
          if (response) {
            setPrompt(response.data);
          } else {
            busy.current = false;
          }
        },
        onError: () => {
          busy.current = false;
        },
      });
    });
  }, [queryClient, showNext, uiVersion]);

  if (!prompt) return null;

  return (
    <PromptCard
      key={prompt.id}
      prompt={prompt}
      onClose={() => {
        setPrompt(null);
        busy.current = false;
      }}
    />
  );
};

export default FeedbackPrompt;
