import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Text,
  Tooltip,
  colors,
  stylingConsts,
  defaultStyles,
} from '@citizenlab/cl2-component-library';

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
          flexDirection="column"
          alignItems="flex-end"
          gap="8px"
          px="16px"
          pb="16px"
        >
          {snapshot.unsaved && (
            <Text fontSize="s" color="textSecondary" textAlign="right" m="0">
              {formatMessage(messages.newPhase)}
            </Text>
          )}
          <Box
            role="group"
            aria-label={formatMessage(messages.lifecycle)}
            display="flex"
            alignItems="center"
            background={colors.grey200}
            borderRadius={stylingConsts.borderRadius}
            gap="2px"
            p="3px"
          >
            {(['before', 'open', 'ended'] as const).map((value) => {
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
                    bgColor={selected ? colors.white : colors.grey200}
                    bgHoverColor={selected ? colors.white : colors.grey300}
                    textColor={
                      selected ? colors.textPrimary : colors.textSecondary
                    }
                    textHoverColor={colors.textPrimary}
                    textDecorationHover="none"
                    borderRadius={stylingConsts.borderRadius}
                    height="25px"
                    padding="3px 12px"
                    fontSize="12px"
                    fontWeight="500"
                    boxShadow={selected ? defaultStyles.boxShadow : 'none'}
                    onClick={() =>
                      setSelection({
                        state: value,
                        configured: configuredLifecycle,
                      })
                    }
                  >
                    {formatMessage(label)}
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PhasePreview;
