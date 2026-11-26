import React, { useEffect, useRef, useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import PreviewStateSelector from 'design-system/PreviewStateSelector';

import PhonePreview from 'components/admin/PhonePreview';

import { useIntl } from 'utils/cl-intl';
import { getPreviewLifecycle } from 'utils/phasePreview/lifecycle';
import {
  getPreviewPhaseAttributes,
  PREVIEW_FRAME_NAME,
  PreviewSnapshot,
  PreviewLifecycle,
} from 'utils/phasePreview/types';

import messages from './messages';
import SimulateBar from './SimulateBar';

const lifecycleOptions = {
  before: {
    label: messages.before,
    tooltip: messages.beforeTooltip2,
  },
  open: {
    label: messages.open,
    tooltip: messages.openTooltip2,
  },
  ended: {
    label: messages.ended,
    tooltip: messages.endedTooltip2,
  },
} satisfies Record<
  PreviewLifecycle,
  {
    label: typeof messages.before;
    tooltip: typeof messages.beforeTooltip2;
  }
>;

const LIFECYCLES: PreviewLifecycle[] = ['before', 'open', 'ended'];

interface Props {
  src: string;
  title: string;
  snapshot: Omit<PreviewSnapshot, 'phase'> & {
    phase?: PreviewSnapshot['phase'];
  };
  skeleton?: boolean;
}

const PhasePreview = ({ src, title, snapshot, skeleton = false }: Props) => {
  const { formatMessage } = useIntl();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [blocked, setBlocked] = useState(false);
  const attributes = snapshot.phase?.attributes;
  const method = attributes?.participation_method;
  const isInformation = method === 'information';
  const configuredLifecycle = getPreviewLifecycle(
    getPreviewPhaseAttributes(snapshot)
  );
  // A manual choice holds until the edited dates move the phase to another
  // lifecycle; the preview then follows the dates again.
  const [selection, setSelection] = useState<{
    state: PreviewLifecycle;
    configured: PreviewLifecycle;
  }>();
  if (selection && selection.configured !== configuredLifecycle) {
    setSelection(undefined);
  }
  const selectedState =
    selection?.configured === configuredLifecycle
      ? selection.state
      : configuredLifecycle;
  const state = isInformation ? configuredLifecycle : selectedState;
  const payload = JSON.stringify({
    ...snapshot,
    lifecycle: state,
    showParticipation: state !== 'before',
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

      if (event.data?.type === 'phase-preview-blocked') setBlocked(true);
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
          bottomSpace={(isInformation ? 0 : 56) + (blocked ? 32 : 0)}
          skeleton={skeleton}
        />
      </Box>
      <Box role="status" px="16px">
        {blocked && (
          <Text
            fontSize="s"
            color="textSecondary"
            textAlign="right"
            m="0"
            mb={isInformation ? '16px' : '8px'}
          >
            {formatMessage(messages.blocked)}
          </Text>
        )}
      </Box>
      {snapshot.unsaved && !isInformation && (
        <Text
          fontSize="s"
          color="textSecondary"
          textAlign="center"
          m="0 16px 8px"
        >
          {formatMessage(messages.newPhase)}
        </Text>
      )}
      {!isInformation && (
        <SimulateBar>
          <PreviewStateSelector
            aria-label={formatMessage(messages.lifecycle)}
            options={LIFECYCLES.map((value) => ({
              id: value,
              label: formatMessage(lifecycleOptions[value].label),
              tooltip: formatMessage(lifecycleOptions[value].tooltip),
            }))}
            selectedKey={state}
            onSelectionChange={(key) => {
              const picked = LIFECYCLES.find((value) => value === key);
              if (picked) {
                setSelection({
                  state: picked,
                  configured: configuredLifecycle,
                });
              }
            }}
          />
        </SimulateBar>
      )}
    </Box>
  );
};

export default PhasePreview;
