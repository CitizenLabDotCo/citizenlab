// SPIKE (TAN-8619) — throwaway. Do not merge.
//
// Receives draft phase attributes posted by the admin shell and writes them
// into this frame's TanStack cache, so the citizen page re-renders from unsaved
// form state without a save or a reload. Mirrors the mechanism the content
// builder already uses (ProjectPageBuilderPage -> FullscreenPreview/Wrapper),
// except the payload is phase attributes rather than craft.js nodes.
import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import phasesKeys from 'api/phases/keys';
import { IPhase, IPhases, IPhaseData } from 'api/phases/types';

export const DRAFT_PREVIEW_MESSAGE = 'DRAFT_PREVIEW_PHASE';
export const DRAFT_PREVIEW_RESET = 'DRAFT_PREVIEW_RESET';
export const DRAFT_PREVIEW_APPLIED = 'DRAFT_PREVIEW_APPLIED';

export type DraftPreviewMessage = {
  type: typeof DRAFT_PREVIEW_MESSAGE;
  projectId: string;
  phaseId: string;
  attributes: Partial<IPhaseData['attributes']>;
  sentAt: number;
};

// Sent after a save or discard: drop every draft and refetch, so the preview
// picks up whatever the server recomputed (action_descriptors above all).
export type DraftPreviewResetMessage = {
  type: typeof DRAFT_PREVIEW_RESET;
};

export type DraftPreviewAppliedMessage = {
  type: typeof DRAFT_PREVIEW_APPLIED;
  sentAt: number;
};

type Incoming = DraftPreviewMessage | DraftPreviewResetMessage;

const isIncoming = (data: unknown): data is Incoming =>
  typeof data === 'object' &&
  data !== null &&
  ((data as Incoming).type === DRAFT_PREVIEW_MESSAGE ||
    (data as Incoming).type === DRAFT_PREVIEW_RESET);

const DraftPreviewBridge = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only meaningful when hosted by the admin shell.
    if (window.parent === window) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!isIncoming(e.data)) return;

      if (e.data.type === DRAFT_PREVIEW_RESET) {
        queryClient.invalidateQueries({ queryKey: phasesKeys.all() });
        return;
      }

      const { projectId, phaseId, attributes, sentAt } = e.data;

      // PhaseTitle and friends read the item key...
      queryClient.setQueryData<IPhase>(
        phasesKeys.item({ phaseId }),
        (current) =>
          current && {
            ...current,
            data: {
              ...current.data,
              attributes: { ...current.data.attributes, ...attributes },
            },
          }
      );

      // ...while ProjectsShowPage and the CTA bar read the list key.
      queryClient.setQueryData<IPhases>(
        phasesKeys.list({ projectId }),
        (current) =>
          current && {
            ...current,
            data: current.data.map((phase) =>
              phase.id === phaseId
                ? {
                    ...phase,
                    attributes: { ...phase.attributes, ...attributes },
                  }
                : phase
            ),
          }
      );

      const applied: DraftPreviewAppliedMessage = {
        type: DRAFT_PREVIEW_APPLIED,
        sentAt,
      };
      window.parent.postMessage(applied, window.location.origin);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  return null;
};

export default DraftPreviewBridge;
