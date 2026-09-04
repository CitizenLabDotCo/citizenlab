// SPIKE (TAN-8619) — throwaway. Do not merge.
//
// Rough three-pane phase Build view: the real phase form in the rail, a phone
// preview of the citizen phase page in the centre, and a readout on the right
// that says which unsaved fields the preview can and cannot reflect. Exists to
// measure how far draft live preview can go and what saving costs, not to be
// the layout.
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import AdminPhaseEdit from 'containers/Admin/projects/project/phaseSetup';

import {
  DRAFT_PREVIEW_APPLIED,
  DRAFT_PREVIEW_MESSAGE,
  DRAFT_PREVIEW_RESET,
  DraftPreviewAppliedMessage,
  DraftPreviewMessage,
  DraftPreviewResetMessage,
} from 'components/DraftPreviewBridge';

import { useParams } from 'utils/router';

const PHONE_WIDTH = 400;
const PHONE_HEIGHT = 800;
const SCALE = 0.72;

type Verdict = 'live' | 'permission-gated' | 'not-read-by-citizen-page';

// Which phase attributes the citizen page reads client-side (live), which it
// reads but whose *effect* comes from server-computed action_descriptors
// (permission-gated: the gate only refreshes on save), and which nothing on the
// citizen page reads at all. Derived from grepping `attributes.<x>` reads
// outside admin code.
const LIVE = new Set<keyof IUpdatedPhaseProperties>([
  'title_multiloc',
  'description_multiloc',
  'start_at',
  'end_at',
  'participation_method',
  'presentation_mode',
  'available_views',
  'ideas_order',
  'input_term',
  'vote_term',
  'voting_method',
  'voting_min_total',
  'voting_max_total',
  'voting_min_selected_options',
  'voting_max_votes_per_idea',
  'voting_filtering_enabled',
  'autoshare_results_enabled',
  'native_survey_title_multiloc',
  'native_survey_button_multiloc',
  'survey_embed_url',
  'survey_service',
  'survey_popup_frequency',
  'document_annotation_embed_url',
  'report_public',
]);

const PERMISSION_GATED = new Set<keyof IUpdatedPhaseProperties>([
  'submission_enabled',
  'commenting_enabled',
  'reacting_enabled',
  'reacting_like_method',
  'reacting_like_limited_max',
  'reacting_dislike_enabled',
  'reacting_dislike_method',
  'reacting_dislike_limited_max',
  'allow_anonymous_participation',
  'prescreening_mode',
  'user_data_collection',
  'user_fields_in_form_enabled',
]);

const verdictOf = (field: keyof IUpdatedPhaseProperties): Verdict =>
  PERMISSION_GATED.has(field)
    ? 'permission-gated'
    : LIVE.has(field)
    ? 'live'
    : 'not-read-by-citizen-page';

const isApplied = (data: unknown): data is DraftPreviewAppliedMessage =>
  typeof data === 'object' &&
  data !== null &&
  'type' in data &&
  data.type === DRAFT_PREVIEW_APPLIED;

const verdictColor: Record<Verdict, string> = {
  live: colors.success,
  'permission-gated': colors.orange500,
  'not-read-by-citizen-page': colors.grey600,
};

const PhaseBuild = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/build/$phaseId',
  });
  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [draft, setDraft] = useState<IUpdatedPhaseProperties>();
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [postCount, setPostCount] = useState(0);
  // Bumping this remounts the form, which is how it resets to the saved phase.
  const [formInstance, setFormInstance] = useState(0);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data: unknown = e.data;
      if (isApplied(data)) {
        setLatencyMs(Math.round(performance.now() - data.sentAt));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Must be referentially stable: the form mirrors formData in an effect that
  // depends on this callback, so a fresh identity per render (every ACK
  // re-renders us) would post -> ack -> re-render -> post forever. First
  // version of this spike did exactly that: 349 posts for one keystroke.
  const handleFormDataChange = useCallback(
    (formData: IUpdatedPhaseProperties) => {
      setDraft(formData);
      setPostCount((n) => n + 1);
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: DRAFT_PREVIEW_MESSAGE,
          projectId,
          phaseId,
          attributes: formData,
          sentAt: performance.now(),
        } satisfies DraftPreviewMessage,
        window.location.origin
      );
    },
    [projectId, phaseId]
  );

  const postReset = () => {
    const message: DraftPreviewResetMessage = { type: DRAFT_PREVIEW_RESET };
    iframeRef.current?.contentWindow?.postMessage(
      message,
      window.location.origin
    );
  };

  const handleSaved = useCallback(() => {
    const message: DraftPreviewResetMessage = { type: DRAFT_PREVIEW_RESET };
    iframeRef.current?.contentWindow?.postMessage(
      message,
      window.location.origin
    );
  }, []);

  const handleDiscard = () => {
    setDraft(undefined);
    setFormInstance((n) => n + 1);
    postReset();
  };

  if (!project || !phases || !phase) return null;

  const phaseNumber = phases.data.findIndex((p) => p.id === phaseId) + 1;
  const previewSrc = `/${locale}/projects/${project.data.attributes.slug}/${phaseNumber}`;

  const saved = phase.data.attributes;
  const dirtyFields = draft
    ? (Object.keys(draft) as (keyof IUpdatedPhaseProperties)[]).filter(
        (field) => JSON.stringify(draft[field]) !== JSON.stringify(saved[field])
      )
    : [];

  return (
    <Box display="flex" height="100%" minHeight="0">
      <Box
        w="420px"
        flexShrink={0}
        overflowY="auto"
        p="16px"
        borderRight={`1px solid ${colors.grey300}`}
        background={colors.white}
      >
        <AdminPhaseEdit
          key={formInstance}
          onFormDataChange={handleFormDataChange}
          onSaved={handleSaved}
        />
      </Box>

      <Box
        flexGrow={1}
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        p="24px"
        background={colors.background}
        overflowY="auto"
      >
        <Box
          w={`${PHONE_WIDTH * SCALE}px`}
          h={`${PHONE_HEIGHT * SCALE}px`}
          border={`1.5px solid ${colors.grey300}`}
          borderRadius="22px"
          overflow="hidden"
          background={colors.white}
          flexShrink={0}
        >
          <Box
            as="iframe"
            ref={iframeRef}
            src={previewSrc}
            title="Phase preview"
            display="block"
            w={`${PHONE_WIDTH}px`}
            h={`${PHONE_HEIGHT}px`}
            border="none"
            transform={`scale(${SCALE})`}
            style={{ transformOrigin: 'top left' }}
          />
        </Box>
      </Box>

      <Box
        w="320px"
        flexShrink={0}
        overflowY="auto"
        p="16px"
        borderLeft={`1px solid ${colors.grey300}`}
        background={colors.white}
        display="flex"
        flexDirection="column"
        gap="12px"
      >
        <Text fontWeight="bold" m="0">
          SPIKE readout
        </Text>
        <Text m="0" fontSize="s">
          preview: <code>{previewSrc}</code>
        </Text>
        <Text m="0" fontSize="s">
          drafts posted: {postCount} · last round trip:{' '}
          {latencyMs === null ? '—' : `${latencyMs} ms`}
        </Text>
        <Button
          buttonStyle="secondary"
          size="s"
          onClick={handleDiscard}
          disabled={dirtyFields.length === 0}
        >
          Discard draft ({dirtyFields.length})
        </Button>

        <Text fontWeight="bold" m="0" mt="8px">
          Unsaved fields
        </Text>
        {dirtyFields.length === 0 && (
          <Text m="0" fontSize="s" color="textSecondary">
            none — preview shows saved state
          </Text>
        )}
        {dirtyFields.map((field) => {
          const verdict = verdictOf(field);
          return (
            <Box key={field} display="flex" flexDirection="column">
              <Text m="0" fontSize="s" fontWeight="semi-bold">
                {field}
              </Text>
              <Text
                m="0"
                fontSize="xs"
                style={{ color: verdictColor[verdict] }}
              >
                {verdict}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PhaseBuild;
