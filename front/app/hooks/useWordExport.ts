import { useState, useCallback } from 'react';

import { saveAs } from 'file-saver';
import { SupportedLocale } from 'typings';

import { trackEventByName } from 'utils/analytics';
import { generateWordDocument } from 'utils/wordExport/generateWordDocument';
import { WordExportDocument } from 'utils/wordExport/types';

export interface UseWordExportOptions {
  filename?: string;
  locale: SupportedLocale;
  errorMessage: string;
}

export interface UseWordExportReturn {
  downloadWord: (document: WordExportDocument) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

/**
 * Hook for downloading content as a Word (.docx) document.
 *
 * Usage:
 * ```tsx
 * const { downloadWord, isDownloading, error } = useWordExport({
 *   filename: 'my-report',
 *   locale: 'en',
 *   errorMessage: 'Failed to download Word document',
 * });
 *
 * const handleDownload = async () => {
 *   const document: WordExportDocument = {
 *     title: 'My Report',
 *     sections: [
 *       { type: 'text', content: 'Hello World', variant: 'h1' },
 *     ],
 *   };
 *   await downloadWord(document);
 * };
 * ```
 */
export default function useWordExport({
  filename = 'export',
  locale,
  errorMessage,
}: UseWordExportOptions): UseWordExportReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadWord = useCallback(
    async (document: WordExportDocument) => {
      setIsDownloading(true);
      setError(null);

      try {
        // Generate the Word document
        const blob = await generateWordDocument(document, { locale });

        // Generate filename with timestamp
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);

        // Sanitize filename
        const sanitizedFilename = filename
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();

        // Save the file
        saveAs(blob, `${sanitizedFilename}-${timestamp}.docx`);

        // Track the download
        trackEventByName('Word document downloaded', {
          filename: sanitizedFilename,
          sectionCount: document.sections.length,
        });
      } catch (err) {
        console.error('Word download error:', err);
        setError(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [filename, locale, errorMessage]
  );

  return {
    downloadWord,
    isDownloading,
    error,
  };
}
