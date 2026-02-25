/**
 * useWordSection — registration API for exportable insight components.
 * Components register serializer functions that return WordSection[] arrays.
 */
import { useEffect, useRef, useCallback } from 'react';

import type { SpacerSize } from 'utils/word/utils/styleConstants';

import { useWordExportContext } from './WordExportContext';

import type { ExportId } from './exportRegistry';
import type { Paragraph, Table } from 'docx';

/** Unified section type for the Word document schema. */
export type WordSection =
  | { type: 'heading'; text: string; level: 1 | 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'html'; html: string }
  | {
      type: 'image';
      image: Uint8Array;
      width: number;
      height: number;
      caption?: string;
    }
  | { type: 'table'; rows: string[][]; columnWidths?: number[] }
  | {
      type: 'breakdown';
      items: Array<{
        name: string;
        count: number;
        color?: string;
        percentage?: number;
      }>;
      title?: string;
    }
  | { type: 'spacer'; size?: SpacerSize }
  /**
   * Escape hatch for pre-built docx objects (Paragraph | Table).
   * Use sparingly — only when an existing converter already produces docx
   * objects and migrating it to WordSection would be high effort.
   */
  | { type: 'docx-elements'; elements: (Paragraph | Table)[] };

export type WordSerializer = () => Promise<WordSection[]> | WordSection[];

interface UseWordSectionOptions {
  /** When true, this section is omitted from the export (loading, error, empty state) */
  skip?: boolean;
}

export function useWordSection(
  exportId: ExportId,
  serializer: WordSerializer,
  options: UseWordSectionOptions = {}
): void {
  const { registerSerializer, unregisterSerializer, setSerializerSkipped } =
    useWordExportContext();

  const serializerRef = useRef(serializer);
  serializerRef.current = serializer;

  const stableSerializer = useCallback<WordSerializer>(
    () => serializerRef.current(),
    []
  );

  useEffect(() => {
    registerSerializer(exportId, stableSerializer);
    return () => {
      unregisterSerializer(exportId);
    };
  }, [exportId, stableSerializer, registerSerializer, unregisterSerializer]);

  useEffect(() => {
    setSerializerSkipped(exportId, options.skip ?? false);
  }, [exportId, options.skip, setSerializerSkipped]);
}
