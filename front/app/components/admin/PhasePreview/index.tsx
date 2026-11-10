import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import useCauses from 'api/causes/useCauses';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import usePollResponses from 'api/poll_responses/usePollResponses';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';

import PhonePreview from 'components/admin/PhonePreview';

import { useIntl } from 'utils/cl-intl';
import { getPreviewLifecycle } from 'utils/phasePreview/lifecycle';
import {
  PREVIEW_FRAME_NAME,
  PreviewSnapshot,
  PreviewLifecycle,
} from 'utils/phasePreview/types';

import messages from './messages';

type PreviewState = PreviewLifecycle | 'participation';

const lifecycleOptions = {
  before: {
    label: messages.before,
    description: messages.viewBefore,
    tooltip: messages.beforeTooltip,
  },
  open: {
    label: messages.open,
    description: messages.viewOpen,
    tooltip: messages.openTooltip,
  },
  participation: {
    label: messages.participation,
    description: messages.viewParticipation,
    tooltip: messages.participationTooltip,
  },
  ended: {
    label: messages.ended,
    description: messages.viewEnded,
    tooltip: messages.endedTooltip,
  },
} satisfies Record<
  PreviewState,
  {
    label: typeof messages.before;
    description: typeof messages.viewBefore;
    tooltip: typeof messages.beforeTooltip;
  }
>;

interface Props {
  src: string;
  title: string;
  snapshot: Omit<PreviewSnapshot, 'phase'> & {
    phase?: PreviewSnapshot['phase'];
  };
}

const PhasePreview = ({ src, title, snapshot }: Props) => {
  const { formatMessage } = useIntl();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const attributes = snapshot.phase?.attributes;
  const method = attributes?.participation_method;
  const phaseId = snapshot.unsaved ? undefined : snapshot.phase?.id;
  const isInformation = method === 'information';
  const hasInputList =
    method === 'ideation' ||
    method === 'proposals' ||
    method === 'common_ground';
  const isNativeSurvey =
    method === 'native_survey' || method === 'community_monitor_survey';
  const { data: inputs } = useIdeasFilterCounts(
    { phase: phaseId, publication_status: 'published' },
    !!phaseId && hasInputList
  );
  const { data: submissions } = useSubmissionCount({
    phaseId: isNativeSurvey ? phaseId : undefined,
  });
  const { data: poll } = usePollResponses({
    phaseId: method === 'poll' ? phaseId ?? null : null,
  });
  const { data: causes } = useCauses({
    phaseId: method === 'volunteering' ? phaseId ?? null : null,
  });

  const hasParticipation =
    !!phaseId &&
    ((inputs?.data.attributes.total ?? 0) > 0 ||
      (submissions?.data.attributes.totalSubmissions ?? 0) > 0 ||
      Object.values(poll?.data.attributes.series.options ?? {}).some(
        (count) => count > 0
      ) ||
      causes?.data.some((cause) => cause.attributes.volunteers_count > 0) ||
      (attributes?.participation_method === 'voting' &&
        (attributes.total_votes_amount > 0 ||
          attributes.votes_count > 0 ||
          attributes.baskets_count > 0 ||
          (attributes.manual_voters_amount ?? 0) > 0)));
  const configuredLifecycle = getPreviewLifecycle({
    ...attributes,
    ...snapshot.draft,
  });
  const [selectedState, setState] = useState<PreviewState>(configuredLifecycle);
  const state = isInformation
    ? configuredLifecycle
    : selectedState === 'participation' && !hasParticipation
    ? 'open'
    : selectedState;
  const payload = JSON.stringify({
    ...snapshot,
    lifecycle: state === 'participation' ? 'open' : state,
    showParticipation: state === 'participation' || state === 'ended',
  });
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === 'phase-preview-ready') {
        frameRef.current.contentWindow?.postMessage(
          {
            type: 'phase-preview-snapshot',
            snapshot: JSON.parse(payloadRef.current),
          },
          window.location.origin
        );
      }
    };

    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'phase-preview-snapshot', snapshot: JSON.parse(payload) },
        window.location.origin
      );
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [payload]);

  if (!snapshot.phase) {
    return (
      <Box p="24px">
        <Text>{formatMessage(messages.newPhase)}</Text>
      </Box>
    );
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box flex="1" minHeight="0">
        <PhonePreview
          src={src}
          title={title}
          frameName={PREVIEW_FRAME_NAME}
          frameRef={frameRef}
          dataCy="e2e-phase-preview"
          bottomSpace={isInformation ? 0 : snapshot.unsaved ? 88 : 56}
        />
      </Box>
      {!isInformation && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="8px"
          px="12px"
          pb="12px"
        >
          <Box
            role="group"
            aria-label={formatMessage(messages.lifecycle)}
            display="flex"
            alignItems="center"
            background={colors.black}
            borderRadius="999px"
            p="2px"
          >
            {(['before', 'open', 'participation', 'ended'] as const).map(
              (value) => {
                if (value === 'participation' && !hasParticipation) return null;

                const selected = state === value;
                const { label, tooltip } = lifecycleOptions[value];

                return (
                  <Tooltip
                    key={value}
                    content={formatMessage(tooltip)}
                    placement="top"
                    theme="dark"
                    useContentWrapper={false}
                  >
                    <Button
                      buttonStyle="text"
                      ariaPressed={selected}
                      bgColor={selected ? colors.grey800 : colors.black}
                      bgHoverColor={colors.grey800}
                      textColor={selected ? colors.white : colors.coolGrey300}
                      textHoverColor={colors.white}
                      textDecorationHover="none"
                      borderRadius="999px"
                      height="20px"
                      padding="0 8px"
                      fontSize="11px"
                      onClick={() => setState(value)}
                    >
                      {formatMessage(label)}
                    </Button>
                  </Tooltip>
                );
              }
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            ml="auto"
            gap="4px"
          >
            <Box
              background={colors.grey200}
              borderRadius="6px"
              px="10px"
              py="4px"
            >
              <Text
                aria-live="polite"
                fontSize="s"
                color="textSecondary"
                textAlign="right"
                m="0"
              >
                {formatMessage(lifecycleOptions[state].description)}
              </Text>
            </Box>
            {snapshot.unsaved && (
              <Text fontSize="s" color="textSecondary" textAlign="right" m="0">
                {formatMessage(messages.newPhase)}
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PhasePreview;
