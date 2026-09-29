import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const PHONE_LOGICAL_WIDTH = 400;
const PHONE_LOGICAL_HEIGHT = 800;
const DEFAULT_PREVIEW_SCALE = 0.8;
const MAX_PREVIEW_SCALE = 1;
const PREVIEW_AREA_PADDING = 32;

// Render the preview interior at a fixed logical phone viewport and scale the
// whole thing down to fit the frame, so components keep their real proportions
// instead of being squeezed into a narrow iframe ("scale, don't shrink"). The
// frame size is derived from the scale, so the same trick fits any viewport.
const Card = styled(Box)`
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 0 0 3px rgba(44, 110, 125, 0.42),
      0 18px 42px rgba(20, 25, 40, 0.16);
  }
`;

const CornerEditButton = styled(Button)`
  transition: opacity 140ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 0;
    pointer-events: none;
  }
`;

const Overlay = styled(Box)`
  transition: opacity 160ms ease-out, visibility 160ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 1;
    visibility: visible;
  }
`;

const CtaWrapper = styled(Box)`
  transition: transform 160ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    transform: translateY(0);
  }
`;

type Props = {
  src: string;
  iframeTitle: string;
  editPageContentAriaLabel: string;
  onEdit: () => void;
  dataCy?: string;
  editPageContentClassName?: string;
  // Starts the phone at the top of the area, to line up with content beside it.
  alignTop?: boolean;
};

const PagePreview = ({
  src,
  iframeTitle,
  editPageContentAriaLabel,
  onEdit,
  dataCy,
  editPageContentClassName,
  alignTop = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(DEFAULT_PREVIEW_SCALE);

  // Fit the phone to the visible area: shrink as far as needed so nothing is
  // cut off, grow on large screens up to the cap. Sized against the window
  // (not the container) because the container's height follows its content.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeScale = () => {
      const { top, width } = container.getBoundingClientRect();
      const availableWidth = width - 2 * PREVIEW_AREA_PADDING;
      const availableHeight =
        window.innerHeight - top - 2 * PREVIEW_AREA_PADDING;
      const fit = Math.min(
        availableWidth / PHONE_LOGICAL_WIDTH,
        availableHeight / PHONE_LOGICAL_HEIGHT
      );
      setScale(Math.max(0, Math.min(MAX_PREVIEW_SCALE, fit)));
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(container);
    window.addEventListener('resize', computeScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      minHeight="100%"
      display="flex"
      alignItems={alignTop ? 'flex-start' : 'center'}
      justifyContent="center"
      p={`${PREVIEW_AREA_PADDING}px`}
      pt={alignTop ? '0px' : `${PREVIEW_AREA_PADDING}px`}
      background={`radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`}
    >
      <Card
        data-cy={dataCy}
        position="relative"
        w={`${PHONE_LOGICAL_WIDTH * scale}px`}
        h={`${PHONE_LOGICAL_HEIGHT * scale}px`}
        background={colors.white}
        border={`1.5px solid ${colors.grey300}`}
        borderRadius="22px"
        overflow="hidden"
        boxShadow="0 10px 30px rgba(20, 25, 40, 0.07)"
      >
        <Box
          as="iframe"
          src={src}
          title={iframeTitle}
          display="block"
          w={`${PHONE_LOGICAL_WIDTH}px`}
          h={`${PHONE_LOGICAL_HEIGHT}px`}
          border="none"
          transform={`scale(${scale})`}
          style={{ transformOrigin: 'top left' }}
        />
        <CornerEditButton
          position="absolute"
          top="12px"
          right="12px"
          buttonStyle="primary"
          size="s"
          icon="edit"
          iconSize="16px"
          borderColor={colors.grey300}
          borderRadius="6px"
          padding="4px 10px"
          fontSize="12px"
          onClick={onEdit}
          text={formatMessage(messages.edit)}
        />
        <Overlay
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          left="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="rgba(18, 38, 44, 0.3)"
          opacity={0}
          visibility="hidden"
          // Let wheel/scroll fall through to the iframe so the preview stays scrollable
          pointerEvents="none"
        >
          <CtaWrapper
            className={editPageContentClassName}
            pointerEvents="auto"
            transform="translateY(7px)"
          >
            <Button
              icon="edit"
              buttonStyle="primary"
              onClick={onEdit}
              ariaLabel={editPageContentAriaLabel}
              dataCy="e2e-edit-page-content"
              text={formatMessage(messages.editPageContent)}
            />
          </CtaWrapper>
        </Overlay>
      </Card>
    </Box>
  );
};

export default PagePreview;
