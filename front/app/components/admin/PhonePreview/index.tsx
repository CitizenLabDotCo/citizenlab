import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { PREVIEW_PAINTED } from 'utils/previewFrame/painted';

import PhonePreviewFrame from './PhonePreviewFrame';
import PhoneScreenSkeleton from './PhoneScreenSkeleton';

const PAINT_TIMEOUT = 10000;

interface Props {
  src: string;
  frameName?: string;
  frameRef?: React.Ref<HTMLIFrameElement>;
  title: string;
  interactive?: boolean;
  className?: string;
  dataCy?: string;
  // Starts the phone at the top of the area, to line up with content beside it. The area then
  // takes its height from the phone, so nothing is clipped and a hover ring can show at the top.
  alignTop?: boolean;
  bottomSpace?: number;
  // Shows a skeleton screen until the page in the phone shows its content.
  skeleton?: boolean;
  shadow?: boolean;
  children?: ReactNode;
}

const PhonePreview = ({
  src,
  frameName,
  frameRef,
  title,
  interactive = true,
  className,
  dataCy,
  alignTop = false,
  bottomSpace = 0,
  skeleton = false,
  shadow = true,
  children,
}: Props) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const [paintedSrc, setPaintedSrc] = useState<string>();

  useEffect(() => {
    if (!skeleton) return;

    const receive = (event: MessageEvent) => {
      const frameWindow =
        screenRef.current?.querySelector('iframe')?.contentWindow;
      if (
        event.origin === window.location.origin &&
        event.source === frameWindow &&
        event.data?.type === PREVIEW_PAINTED
      ) {
        setPaintedSrc(src);
      }
    };
    // Never keeps the skeleton over a page that does not report back.
    const fallback = window.setTimeout(() => setPaintedSrc(src), PAINT_TIMEOUT);

    window.addEventListener('message', receive);
    return () => {
      window.removeEventListener('message', receive);
      window.clearTimeout(fallback);
    };
  }, [skeleton, src]);

  return (
    <PhonePreviewFrame
      className={className}
      dataCy={dataCy}
      alignTop={alignTop}
      bottomSpace={bottomSpace}
      shadow={shadow}
      screen={
        <Box ref={screenRef} w="100%" h="100%">
          <Box
            as="iframe"
            ref={frameRef}
            name={frameName}
            // The phase preview needs the same origin to read the session and talk to
            // the editor, so this sandbox cannot isolate it from the parent page.
            // It only blocks popups, downloads, dialogs and top-level navigation.
            // Writes are blocked inside the frame by utils/phasePreview/runtime.
            sandbox={
              frameName
                ? 'allow-scripts allow-same-origin allow-forms'
                : undefined
            }
            src={src}
            title={title}
            tabIndex={interactive ? undefined : -1}
            aria-hidden={interactive ? undefined : true}
            pointerEvents={interactive ? undefined : 'none'}
            display="block"
            w="100%"
            h="100%"
            border="none"
          />
        </Box>
      }
    >
      {skeleton && <PhoneScreenSkeleton hidden={paintedSrc === src} />}
      {children}
    </PhonePreviewFrame>
  );
};

export default PhonePreview;
