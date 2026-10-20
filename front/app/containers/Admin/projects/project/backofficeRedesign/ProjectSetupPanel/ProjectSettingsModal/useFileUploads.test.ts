import { act, renderHook, waitFor } from 'utils/testUtils/rtl';

import useFileUploads from './useFileUploads';

const mockAddFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockTrackFileUpload = jest.fn();

jest.mock('api/files/useAddFile', () => () => ({ mutateAsync: mockAddFile }));
jest.mock('api/files/useDeleteFile', () => () => ({ mutate: mockDeleteFile }));
jest.mock('api/me/useAuthUser', () => () => ({ data: null }));
jest.mock('utils/fileUtils', () => ({
  getBase64FromFile: () => Promise.resolve('base64'),
}));
jest.mock('containers/Admin/projects/_shared/fileUploads/utils', () => ({
  ...jest.requireActual('containers/Admin/projects/_shared/fileUploads/utils'),
  trackFileUpload: (...args: unknown[]) => mockTrackFileUpload(...args),
}));

const makeFile = (name: string, size = 10) => {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useFileUploads', () => {
  beforeEach(() => {
    mockAddFile.mockReset();
    mockDeleteFile.mockReset();
    mockTrackFileUpload.mockReset();
    mockAddFile.mockResolvedValue({ data: { id: 'file-id' } });
  });

  it('queues dropped files and marks files over 50 MB as too large', () => {
    const { result } = renderHook(() => useFileUploads('project'));

    act(() =>
      result.current.addFiles([
        makeFile('small.pdf'),
        makeFile('big.mp4', 60 * 1024 * 1024),
      ])
    );

    expect(result.current.uploads.map(({ status }) => status)).toEqual([
      'queued',
      'too_large',
    ]);
    expect(mockAddFile).not.toHaveBeenCalled();
  });

  it('rejects a drop that would take the list past 35 files', () => {
    const { result } = renderHook(() => useFileUploads('project'));

    act(() =>
      result.current.addFiles(
        Array.from({ length: 30 }, (_, i) => makeFile(`${i}.pdf`))
      )
    );
    act(() =>
      result.current.addFiles(
        Array.from({ length: 6 }, (_, i) => makeFile(`more-${i}.pdf`))
      )
    );

    expect(result.current.uploads).toHaveLength(30);
    expect(result.current.tooManyFiles).toBe(true);
  });

  it('uploads queued files once with their category and the AI setting', async () => {
    const { result } = renderHook(() => useFileUploads('project'));

    act(() => result.current.addFiles([makeFile('report.pdf')]));
    act(() => result.current.setCategory(0, 'report'));
    act(() => result.current.setAllowAiProcessing(true));
    act(() => {
      result.current.uploadQueued();
      result.current.uploadQueued();
    });

    await waitFor(() =>
      expect(result.current.uploads[0].status).toBe('uploaded')
    );
    expect(mockAddFile).toHaveBeenCalledTimes(1);
    expect(mockAddFile).toHaveBeenCalledWith({
      content: 'base64',
      project: 'project',
      name: 'report.pdf',
      category: 'report',
      ai_processing_allowed: true,
    });
    expect(mockTrackFileUpload).toHaveBeenCalledTimes(1);
  });

  it('retries a failed upload with the AI setting it started with', async () => {
    mockAddFile.mockRejectedValueOnce(new Error('failed'));
    const { result } = renderHook(() => useFileUploads('project'));

    act(() => result.current.addFiles([makeFile('report.pdf')]));
    act(() => result.current.uploadQueued());
    await waitFor(() => expect(result.current.uploads[0].status).toBe('error'));

    act(() => result.current.setAllowAiProcessing(true));
    await act(() => result.current.retry(result.current.uploads[0]));

    expect(result.current.uploads[0].status).toBe('uploaded');
    expect(mockAddFile).toHaveBeenLastCalledWith(
      expect.objectContaining({ ai_processing_allowed: false })
    );
  });

  it('deletes an uploaded file when it is removed', async () => {
    const { result } = renderHook(() => useFileUploads('project'));

    act(() => result.current.addFiles([makeFile('report.pdf')]));
    act(() => result.current.uploadQueued());
    await waitFor(() =>
      expect(result.current.uploads[0].status).toBe('uploaded')
    );

    act(() => result.current.remove(result.current.uploads[0]));

    expect(mockDeleteFile).toHaveBeenCalledWith('file-id');
    expect(result.current.uploads).toHaveLength(0);
  });
});
