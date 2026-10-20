import { act, renderHook } from 'utils/testUtils/rtl';

import useFilesDraft from './useFilesDraft';

const mockAddFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockTrackFileUpload = jest.fn();

jest.mock('api/files/useAddFile', () => () => ({ mutateAsync: mockAddFile }));
jest.mock('api/files/useDeleteFile', () => () => ({
  mutateAsync: mockDeleteFile,
}));
jest.mock('api/me/useAuthUser', () => () => ({ data: null }));
jest.mock('utils/fileUtils', () => ({
  getBase64FromFile: () => Promise.resolve('base64'),
}));
jest.mock('containers/Admin/projects/_shared/fileUploads/utils', () => ({
  ...jest.requireActual('containers/Admin/projects/_shared/fileUploads/utils'),
  trackFileUpload: (...args: unknown[]) => mockTrackFileUpload(...args),
}));

const makeFile = (name: string) => new File(['x'], name);

describe('useFilesDraft', () => {
  beforeEach(() => {
    mockAddFile.mockReset();
    mockDeleteFile.mockReset();
    mockTrackFileUpload.mockReset();
    mockAddFile.mockResolvedValue({ data: { id: 'file-id' } });
    mockDeleteFile.mockResolvedValue(undefined);
  });

  it('keeps added and removed files in the draft until saved', () => {
    const { result } = renderHook(() => useFilesDraft('project'));

    act(() =>
      result.current.addFiles([{ file: makeFile('report.pdf') }], false)
    );
    act(() => result.current.removeFile('old-file'));

    expect(result.current.dirty).toBe(true);
    expect(result.current.uploads).toHaveLength(1);
    expect(result.current.deletedIds).toEqual(['old-file']);
    expect(mockAddFile).not.toHaveBeenCalled();
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it('uploads and deletes on save, then clears the draft', async () => {
    const { result } = renderHook(() => useFilesDraft('project'));

    act(() =>
      result.current.addFiles(
        [{ file: makeFile('report.pdf'), category: 'report' }],
        true
      )
    );
    act(() => result.current.removeFile('old-file'));

    let saved = false;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(true);
    expect(mockAddFile).toHaveBeenCalledWith({
      content: 'base64',
      project: 'project',
      name: 'report.pdf',
      category: 'report',
      ai_processing_allowed: true,
    });
    expect(mockDeleteFile).toHaveBeenCalledWith('old-file');
    expect(mockTrackFileUpload).toHaveBeenCalledTimes(1);
    expect(result.current.dirty).toBe(false);
  });

  it('keeps only what failed, so saving again retries just that', async () => {
    mockAddFile
      .mockResolvedValueOnce({ data: { id: 'a' } })
      .mockRejectedValueOnce(new Error('failed'));
    const { result } = renderHook(() => useFilesDraft('project'));

    act(() =>
      result.current.addFiles(
        [{ file: makeFile('a.pdf') }, { file: makeFile('b.pdf') }],
        false
      )
    );

    let saved = true;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(false);
    expect(
      result.current.uploads.map(({ file, status }) => [file.name, status])
    ).toEqual([['b.pdf', 'error']]);

    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBe(true);
    expect(mockAddFile).toHaveBeenCalledTimes(3);
    expect(mockAddFile).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'b.pdf' })
    );
  });

  it('drops an unsaved file when it is removed', () => {
    const { result } = renderHook(() => useFilesDraft('project'));

    act(() => result.current.addFiles([{ file: makeFile('a.pdf') }], false));
    act(() => result.current.removeUpload(result.current.uploads[0].key));

    expect(result.current.dirty).toBe(false);
  });
});
