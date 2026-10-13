import React, { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  FeedbackPromptTrigger,
  FeedbackPromptUiVersion,
  IFeedbackPromptData,
} from 'api/feedback_prompts/types';
import useShowNextFeedbackPrompt from 'api/feedback_prompts/useShowNextFeedbackPrompt';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { pageChanges$ } from 'utils/analytics';

import PromptCard from './PromptCard';
import {
  MIN_PROJECT_VISIT_MS,
  ProjectPage,
  getAdminArea,
  getProjectPage,
} from './utils';

interface ProjectVisit extends ProjectPage {
  startedAt: number;
}

// Asks admins and project managers short questions about how the back office
// works for them. Due prompts are decided by the back-end; we check for one at
// the moments a task is likely done: after a successful save, and after leaving
// a project's back office.
const FeedbackPrompt = () => {
  const queryClient = useQueryClient();
  const isBackofficeRedesign = useProjectBackofficeRedesign();
  const { mutate: showNext } = useShowNextFeedbackPrompt();
  const [prompt, setPrompt] = useState<IFeedbackPromptData | null>(null);
  const busy = useRef(false);
  const adminArea = useRef(getAdminArea(window.location.pathname));
  const projectVisit = useRef<ProjectVisit | null>(null);

  const uiVersion: FeedbackPromptUiVersion = isBackofficeRedesign
    ? 'project_backoffice_v2'
    : 'project_backoffice_v1';

  useEffect(() => {
    const requestPrompt = (
      trigger: FeedbackPromptTrigger,
      area: string | undefined
    ) => {
      if (busy.current) return;

      busy.current = true;
      showNext(
        { trigger, uiVersion, adminArea: area },
        {
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
        }
      );
    };

    const startVisit = (page: ProjectPage | null) => {
      projectVisit.current = page && { ...page, startedAt: Date.now() };
    };
    startVisit(getProjectPage(window.location.pathname));

    const unsubscribeMutations = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type !== 'updated' || event.action.type !== 'success') {
          return;
        }
        if (event.mutation.options.meta?.feedbackPrompt) return;

        requestPrompt('save', adminArea.current);
      });

    const pageChanges = pageChanges$.subscribe(({ path }) => {
      adminArea.current = getAdminArea(path);
      const page = getProjectPage(path);
      const visit = projectVisit.current;

      if (visit && visit.projectId === page?.projectId) {
        visit.adminArea = page.adminArea;
        return;
      }

      if (visit && Date.now() - visit.startedAt >= MIN_PROJECT_VISIT_MS) {
        requestPrompt('project_exit', visit.adminArea);
      }
      startVisit(page);
    });

    return () => {
      unsubscribeMutations();
      pageChanges.unsubscribe();
    };
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
