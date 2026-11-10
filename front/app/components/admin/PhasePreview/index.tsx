import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

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
          bottomSpace={snapshot.unsaved ? 88 : 56}
        />
      </Box>
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
          {(['before', 'open', 'ended'] as const).map((value) => {
            const selected = lifecycle === value;

            return (
              <Button
                key={value}
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
                onClick={() => setLifecycle(value)}
              >
                {formatMessage(lifecycleOptions[value].label)}
              </Button>
            );
          })}
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
              {formatMessage(lifecycleOptions[lifecycle].description)}
            </Text>
          </Box>
          {snapshot.unsaved && (
            <Text fontSize="s" color="textSecondary" textAlign="right" m="0">
              {formatMessage(messages.newPhase)}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PhasePreview;
