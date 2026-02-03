import React, { useRef, useEffect, ReactNode } from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

import { ExportId } from './exportRegistry';
import { useWordExportContext } from './WordExportContext';

interface Props extends Omit<BoxProps, 'ref'> {
  exportId: ExportId;
  children: ReactNode;
  // Optional: skip registration if condition not met (e.g., no data)
  skipExport?: boolean;
}

const ExportableInsight = ({
  exportId,
  children,
  skipExport = false,
  ...boxProps
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerExportRef, unregisterExportRef } = useWordExportContext();

  useEffect(() => {
    if (skipExport || !containerRef.current) return;

    registerExportRef(exportId, containerRef.current);

    return () => {
      unregisterExportRef(exportId);
    };
  }, [exportId, skipExport, registerExportRef, unregisterExportRef]);

  return (
    <Box ref={containerRef} data-export-id={exportId} {...boxProps}>
      {children}
    </Box>
  );
};

export default ExportableInsight;
