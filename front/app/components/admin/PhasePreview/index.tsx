import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import PhonePreview from 'components/admin/PhonePreview';

import { useIntl } from 'utils/cl-intl';
import { getPreviewLifecycle } from 'utils/phasePreview/lifecycle';
import {
  PREVIEW_FRAME_NAME,
  PreviewSnapshot,
  PreviewLifecycle,
} from 'utils/phasePreview/types';

import messages from './messages';

const lifecycleOptions = {
  before: { label: messages.before, description: messages.viewBefore },
  open: { label: messages.open, description: messages.viewOpen },
  ended: { label: messages.ended, description: messages.viewEnded },
} satisfies Record<
  PreviewLifecycle,
  { label: typeof messages.before; description: typeof messages.viewBefore }
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
  const [lifecycle, setLifecycle] = useState<PreviewLifecycle>(() =>
    getPreviewLifecycle({ ...snapshot.phase?.attributes, ...snapshot.draft })
  );
  const payload = JSON.stringify({ ...snapshot, lifecycle });
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
          bottomSpace={snapshot.unsaved ? 142 : 92}
        />
      </Box>
      <Box
        role="group"
        aria-label={formatMessage(messages.lifecycle)}
        display="flex"
        justifyContent="center"
        gap="8px"
        p="8px"
      >
        {(Object.keys(lifecycleOptions) as PreviewLifecycle[]).map((value) => (
          <Button
            key={value}
            buttonStyle={
              lifecycle === value ? 'admin-dark' : 'secondary-outlined'
            }
            ariaPressed={lifecycle === value}
            padding="8px 12px"
            onClick={() => setLifecycle(value)}
          >
            {formatMessage(lifecycleOptions[value].label)}
          </Button>
        ))}
      </Box>
      <Text
        aria-live="polite"
        fontSize="s"
        color="textSecondary"
        textAlign="center"
        m="0"
        px="12px"
        pb="8px"
      >
        {formatMessage(lifecycleOptions[lifecycle].description)}
      </Text>
      {snapshot.unsaved && (
        <Text
          fontSize="s"
          color="textSecondary"
          textAlign="center"
          m="0"
          p="12px"
        >
          {formatMessage(messages.newPhase)}
        </Text>
      )}
    </Box>
  );
};

export default PhasePreview;
