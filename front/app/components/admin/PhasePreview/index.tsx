import React, { useEffect, useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import PhonePreview from 'components/admin/PhonePreview';

import { useIntl } from 'utils/cl-intl';
import { PREVIEW_FRAME_NAME, PreviewSnapshot } from 'utils/phasePreview/types';

import messages from './messages';

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
  const payload = JSON.stringify(snapshot);
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
    <PhonePreview
      src={src}
      title={title}
      frameName={PREVIEW_FRAME_NAME}
      frameRef={frameRef}
      dataCy="e2e-phase-preview"
    />
  );
};

export default PhasePreview;
