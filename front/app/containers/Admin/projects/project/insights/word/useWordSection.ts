/**
 * useWordSection — registration API for exportable insight components.
 *
 * Each component that contributes to the Word export registers a serializer
 * function via this hook. The serializer is called during document generation
 * and returns an array of WordSection objects.
 *
 * This replaces the DOM ref registration pattern in ExportableInsight.
 * No DOM manipulation, no scroll hacks, no opacity manipulation.
 *
 * Usage for a chart component (SVG):
 *
 *   const chartRef = useRef<SVGElement>(null);
 *
 *   useWordSection('participation-timeline', async () => {
 *     if (!chartRef.current) return [];
 *     const image = await svgElementToImageBuffer(chartRef.current);
 *     const { width, height } = chartRef.current.getBoundingClientRect();
 *     return [{ type: 'image', image, width: Math.round(width), height: Math.round(height) }];
 *   }, { skip: !isLoaded });
 *
 * Usage for a data section (native Word table):
 *
 *   useWordSection('participation-metrics', () => {
 *     if (!metrics) return [];
 *     return createMetricsSections(metrics, intl);
 *   });
 */
import { useEffect, useRef, useCallback } from 'react';

import { useWordExportContext } from './WordExportContext';

import type { ExportId } from './exportRegistry';

/**
 * Unified section type for the Word document schema.
 * Both Insights and Report Builder produce these — one renderer handles all.
 */
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
  | { type: 'spacer'; size?: 'small' | 'medium' | 'large' }
  /**
   * Escape hatch for pre-built docx objects (Paragraph | Table).
   * Use sparingly — only when an existing converter already produces docx
   * objects and migrating it to WordSection would be high effort.
   */
  | { type: 'docx-elements'; elements: any[] };

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

  // Keep serializer in a ref so we can update it without re-registering
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
