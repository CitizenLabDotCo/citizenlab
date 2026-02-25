import React, { useRef, useEffect, ReactNode } from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

import { htmlToImageBuffer } from 'utils/word/utils/htmlToImage';

import { useWordExportContext } from './WordExportContext';

import type { ExportId } from './exportRegistry';
import type { WordSection } from './useWordSection';

interface Props extends Omit<BoxProps, 'ref'> {
  exportId: ExportId;
  children: ReactNode;
  skipExport?: boolean;
  heading?: string;
}

const ExportableInsight = ({
  exportId,
  children,
  skipExport = false,
  heading,
  ...boxProps
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerSerializer, unregisterSerializer, setSerializerSkipped } =
    useWordExportContext();

  useEffect(() => {
    if (skipExport) return;

    const serialize = async () => {
      const el = containerRef.current;
      if (!el) return [];

      await new Promise<void>((r) => setTimeout(r, 100));

      try {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return [];

        const { buffer } = await htmlToImageBuffer(el, {
          scale: 2,
          backgroundColor: '#FFFFFF',
        });
        const sections: WordSection[] = [];
        if (heading) {
          sections.push({ type: 'heading', text: heading, level: 2 });
        }
        sections.push({
          type: 'image',
          image: buffer,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
        return sections;
      } catch {
        return [];
      }
    };

    registerSerializer(exportId, serialize);

    return () => {
      unregisterSerializer(exportId);
    };
  }, [exportId, heading, skipExport, registerSerializer, unregisterSerializer]);

  useEffect(() => {
    if (skipExport) return;
    setSerializerSkipped(exportId, false);
  }, [exportId, skipExport, setSerializerSkipped]);

  return (
    <Box ref={containerRef} data-export-id={exportId} {...boxProps}>
      {children}
    </Box>
  );
};

export default ExportableInsight;
