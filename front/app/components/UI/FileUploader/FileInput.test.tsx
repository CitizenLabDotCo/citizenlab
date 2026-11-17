import React from 'react';

import { getBase64FromFile } from 'utils/fileUtils';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';

import FileInput from './FileInput';

jest.mock('utils/fileUtils', () => ({
  getBase64FromFile: jest.fn((file: File) =>
    Promise.resolve(`data:${file.type};base64,`)
  ),
}));

const unsupportedError = (fileName: string) =>
  `${fileName} is not supported by our system, it will not be uploaded.`;
const tooLargeError = 'Files larger than 2MB are not permitted.';

const pdfFile = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });
const gpxFile = new File(['gpx'], 'route.gpx', {
  type: 'application/gpx+xml',
});
const kmlFile = new File(['kml'], 'map.kml', {
  type: 'application/vnd.google-earth.kml+xml',
});
const largeFile = new File(['x'.repeat(2_000_001)], 'big.pdf', {
  type: 'application/pdf',
});

const pickFiles = (files: File[]) =>
  fireEvent.change(screen.getByTestId('fileInput'), { target: { files } });

describe('FileInput', () => {
  it('names each rejected file in the unsupported type error', async () => {
    const onAdd = jest.fn();
    render(<FileInput id="file-input" onAdd={onAdd} multiple />);

    pickFiles([gpxFile, pdfFile, kmlFile]);

    expect(
      await screen.findByText(unsupportedError('route.gpx'))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(unsupportedError('map.kml'))
    ).toBeInTheDocument();
    expect(screen.queryByText(/\{fileName\}/)).not.toBeInTheDocument();
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'report.pdf' })
    );
  });

  it('shows the size error and the unsupported type error together', async () => {
    render(
      <FileInput id="file-input" onAdd={jest.fn()} maxSizeMb={2} multiple />
    );

    pickFiles([largeFile, gpxFile]);

    expect(await screen.findByText(tooLargeError)).toBeInTheDocument();
    expect(
      await screen.findByText(unsupportedError('route.gpx'))
    ).toBeInTheDocument();
  });

  it('clears the errors of the previous pick', async () => {
    render(<FileInput id="file-input" onAdd={jest.fn()} maxSizeMb={2} />);

    pickFiles([gpxFile]);
    expect(
      await screen.findByText(unsupportedError('route.gpx'))
    ).toBeInTheDocument();

    pickFiles([largeFile]);
    expect(await screen.findByText(tooLargeError)).toBeInTheDocument();
    expect(
      screen.queryByText(unsupportedError('route.gpx'))
    ).not.toBeInTheDocument();
  });

  it('ignores errors from a pick that finishes after a newer one', async () => {
    let finishFirstPick: (base64: string) => void = () => {};
    jest.mocked(getBase64FromFile).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirstPick = resolve;
        })
    );
    render(<FileInput id="file-input" onAdd={jest.fn()} />);

    pickFiles([gpxFile]);
    pickFiles([kmlFile]);
    expect(
      await screen.findByText(unsupportedError('map.kml'))
    ).toBeInTheDocument();

    await act(async () => {
      finishFirstPick('data:application/gpx+xml;base64,');
    });

    expect(
      screen.queryByText(unsupportedError('route.gpx'))
    ).not.toBeInTheDocument();
  });
});
