import { useCallback, useState } from 'react';

import { saveAs } from 'file-saver';

import {
  createEmptyParagraph,
  createParagraph,
  createTitle,
} from 'utils/word/converters/textConverter';
import {
  WORD_MARGINS,
  WORD_PAGE_SIZE,
  getScaledDimensions,
  getSpacerSpacing,
  type SpacerSize,
} from 'utils/word/utils/styleConstants';

import { createParagraphsFromHtml } from './reportConverters/textWidgetConverter';

export type ReportWordSection =
  | { type: 'text'; html: string }
  | { type: 'whitespace'; size?: SpacerSize }
  | { type: 'iframe'; url: string; title?: string }
  | {
      type: 'image';
      image: Uint8Array;
      width: number;
      height: number;
      widgetName?: string;
    }
  | { type: 'error'; message: string };

interface UseReportWordDownloadOptions {
  filename?: string;
  errorMessage: string;
}

interface UseReportWordDownloadReturn {
  downloadWord: (data: ReportWordData) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

export interface ReportWordData {
  reportTitle: string;
  sections: ReportWordSection[];
}

export default function useReportWordDownload({
  errorMessage,
  filename = 'report',
}: UseReportWordDownloadOptions): UseReportWordDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadWord = useCallback(
    async ({ reportTitle, sections }: ReportWordData) => {
      setIsDownloading(true);
      setError(null);

      try {
        const { Document, Packer, ImageRun, Paragraph } = await import('docx');

        const children = [createTitle(reportTitle), createEmptyParagraph()];

        sections.forEach((section) => {
          switch (section.type) {
            case 'text': {
              const paragraphs = createParagraphsFromHtml(section.html);
              children.push(...paragraphs, createEmptyParagraph());
              break;
            }
            case 'whitespace': {
              children.push(
                createEmptyParagraph(getSpacerSpacing(section.size))
              );
              break;
            }
            case 'iframe': {
              const label = section.title
                ? `${section.title}: ${section.url}`
                : section.url;
              children.push(createParagraph(label), createEmptyParagraph());
              break;
            }
            case 'image': {
              const { width, height } = getScaledDimensions(
                section.width,
                section.height
              );

              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: section.image,
                      transformation: { width, height },
                      type: 'png',
                    }),
                  ],
                }),
                createEmptyParagraph()
              );
              break;
            }
            case 'error': {
              children.push(
                createParagraph(section.message),
                createEmptyParagraph()
              );
              break;
            }
          }
        });

        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  size: {
                    width: WORD_PAGE_SIZE.width,
                    height: WORD_PAGE_SIZE.height,
                  },
                  margin: {
                    top: WORD_MARGINS.top,
                    right: WORD_MARGINS.right,
                    bottom: WORD_MARGINS.bottom,
                    left: WORD_MARGINS.left,
                  },
                },
              },
              children,
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);

        saveAs(blob, `${filename}-${timestamp}.docx`);
      } catch {
        setError(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [errorMessage, filename]
  );

  return {
    downloadWord,
    isDownloading,
    error,
  };
}
