/**
 * ExportableInsight — wraps a UI component and registers it for Word export.
 *
 * Migration bridge: components using ExportableInsight automatically get
 * SVG-native (or html2canvas fallback) image capture in the Word export.
 *
 * To get richer output (data tables instead of screenshots), migrate the
 * component to useWordSection and provide a custom serializer.
 */
import React, { useRef, useEffect, ReactNode } from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

import { htmlToImageBuffer } from 'utils/word/utils/htmlToImage';

import type { ExportId } from './exportRegistry';
import { useWordExportContext } from './WordExportContext';

interface Props extends Omit<BoxProps, 'ref'> {
  exportId: ExportId;
  children: ReactNode;
  /**
   * When true, this component is registered but skipped during export
   * (e.g., loading, error, empty states).
   */
  skipExport?: boolean;
}

const ExportableInsight = ({
  exportId,
  children,
  skipExport = false,
  ...boxProps
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerSerializer, unregisterSerializer, setSerializerSkipped } =
    useWordExportContext();

  // Register a serializer that captures this element as an image
  useEffect(() => {
    const serialize = async () => {
      const el = containerRef.current;
      if (!el) return [];

      // Brief settle time so animated charts finish rendering before capture
      await new Promise<void>((r) => setTimeout(r, 100));

      try {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return [];

        const image = await htmlToImageBuffer(el, {
          scale: 2,
          backgroundColor: '#FFFFFF',
        });
        return [
          {
            type: 'image' as const,
            image,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        ];
      } catch (err) {
        console.error(`[ExportableInsight] Capture failed for "${exportId}":`, err);
        return [];
      }
    };

    registerSerializer(exportId, serialize);

    return () => {
      unregisterSerializer(exportId);
    };
  }, [exportId, registerSerializer, unregisterSerializer]);

  useEffect(() => {
    setSerializerSkipped(exportId, skipExport);
  }, [exportId, skipExport, setSerializerSkipped]);

  return (
    <Box ref={containerRef} data-export-id={exportId} {...boxProps}>
      {children}
    </Box>
  );
};

export default ExportableInsight;
