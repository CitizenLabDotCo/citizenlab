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
  saveProjectExit,
  takeProjectExit,
} from './utils';

interface ProjectVisit extends ProjectPage {
  startedAt: number;
}

const FeedbackPrompt = () => {
  const queryClient = useQueryClient();
  const isBackofficeRedesign = useProjectBackofficeRedesign();
  const { mutateAsync: showNext } = useShowNextFeedbackPrompt();
  const [prompt, setPrompt] = useState<IFeedbackPromptData | null>(null);
  const busy = useRef(false);
  const adminArea = useRef(getAdminArea(window.location.pathname));

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
      // mutate's call-site callbacks are dropped when the observer unsubscribes
      // (e.g. StrictMode's remount), losing a prompt the server marked as shown.
      showNext({ trigger, uiVersion, adminArea: area })
        .then((response) => {
          if (response) {
            setPrompt(response.data);
          } else {
            busy.current = false;
          }
        })
        .catch(() => {
          busy.current = false;
        });
    };

    let visit: ProjectVisit | null = null;
    const startVisit = (page: ProjectPage | null) => {
      visit = page && { ...page, startedAt: Date.now() };
    };
    const isLongVisit = (v: ProjectVisit | null): v is ProjectVisit =>
      !!v && Date.now() - v.startedAt >= MIN_PROJECT_VISIT_MS;

    const currentPage = getProjectPage(window.location.pathname);
    const exit = takeProjectExit();
    if (exit && exit.projectId !== currentPage?.projectId) {
      requestPrompt('project_exit', exit.adminArea);
    }
    startVisit(currentPage);

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

      if (visit && visit.projectId === page?.projectId) {
        visit.adminArea = page.adminArea;
        return;
      }

      // Leaving the back office unmounts this component, either before or just
      // after this event, which would drop a prompt the server already marked
      // as shown. So such an exit is checked on the next back office visit.
      if (isLongVisit(visit)) {
        if (adminArea.current) {
          requestPrompt('project_exit', visit.adminArea);
        } else {
          saveProjectExit(visit);
        }
      }
      startVisit(page);
    });

    return () => {
      unsubscribeMutations();
      pageChanges.unsubscribe();
      if (isLongVisit(visit)) saveProjectExit(visit);
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
