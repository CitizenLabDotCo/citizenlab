import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import { PdfExportProvider, usePdfExportContext } from './PdfExportContext';
import PdfRenderModeProvider from './PdfRenderModeProvider';
import useInsightsPdfDownload from './useInsightsPdfDownload';

jest.mock('./useInsightsPdfDownload', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockDownloadPdf = jest.fn();

jest.mocked(useInsightsPdfDownload).mockReturnValue({
  downloadPdf: mockDownloadPdf,
  isDownloading: false,
  error: null,
  status: 'idle',
  progress: { completed: 0, total: 0 },
  skippedSections: [],
});

const DownloadButton = () => {
  const { downloadPdf, isPdfRenderMode } = usePdfExportContext();
  return (
    <button onClick={downloadPdf}>
      {isPdfRenderMode ? 'render mode' : 'page mode'}
    </button>
  );
};

describe('PdfExportProvider', () => {
  it('downloads when the filename is empty', () => {
    render(
      <PdfExportProvider filename="">
        <DownloadButton />
      </PdfExportProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'page mode' }));

    expect(mockDownloadPdf).toHaveBeenCalledTimes(1);
  });

  it('shares the page download state with the render-mode provider', () => {
    render(
      <PdfExportProvider filename="survey">
        <PdfRenderModeProvider>
          <DownloadButton />
        </PdfRenderModeProvider>
      </PdfExportProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'render mode' }));

    expect(mockDownloadPdf).toHaveBeenCalledTimes(1);
  });
});
