import { useCallback, useState } from 'react';

import { saveAs } from 'file-saver';

import {
  createEmptyParagraph,
  createParagraph,
  createTitle,
} from 'utils/word/converters/textConverter';
import { WORD_MARGINS, WORD_PAGE_SIZE } from 'utils/word/utils/styleConstants';

import { createParagraphsFromHtml } from './reportConverters/textWidgetConverter';

type WhiteSpaceSize = 'small' | 'medium' | 'large';

export type ReportWordSection =
  | { type: 'text'; html: string }
  | { type: 'whitespace'; size?: WhiteSpaceSize }
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

const MAX_IMAGE_WIDTH = 600;

const getScaledDimensions = (width: number, height: number) => {
  if (width <= 0 || height <= 0) {
    return {
      width: MAX_IMAGE_WIDTH,
      height: Math.round(MAX_IMAGE_WIDTH * 0.6),
    };
  }

  const scale = Math.min(1, MAX_IMAGE_WIDTH / width);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

const getWhitespaceSpacing = (size?: WhiteSpaceSize) => {
  switch (size) {
    case 'large':
      return 600;
    case 'medium':
      return 400;
    case 'small':
    default:
      return 200;
  }
};

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
                createEmptyParagraph(getWhitespaceSpacing(section.size))
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
      } catch (err) {
        console.error('Word download error:', err);
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
