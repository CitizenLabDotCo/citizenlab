import { UploadFile } from 'typings';

import { IFileData } from 'api/files/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useEventForm from './useEventForm';

const mockAddEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockGeocode = jest.fn();
const mockAddEventImage = jest.fn();
const mockDeleteEventImage = jest.fn();
const mockSyncFiles = jest.fn();

jest.mock('api/events/useEvent', () => () => ({
  data: undefined,
  isLoading: false,
}));
jest.mock('api/events/useAddEvent', () => () => ({
  mutateAsync: mockAddEvent,
}));
jest.mock('api/events/useUpdateEvent', () => () => ({
  mutateAsync: mockUpdateEvent,
}));
jest.mock('api/event_images/useEventImage', () => () => ({ data: undefined }));
jest.mock('api/event_images/useAddEventImage', () => () => ({
  mutateAsync: mockAddEventImage,
}));
jest.mock('api/event_images/useUpdateEventImage', () => () => ({
  mutateAsync: jest.fn(),
}));
jest.mock('api/event_images/useDeleteEventImage', () => () => ({
  mutateAsync: mockDeleteEventImage,
}));
jest.mock('api/file_attachments/useFileAttachments', () => () => ({
  data: undefined,
}));
jest.mock('api/files/useAddFile', () => () => ({
  mutate: jest.fn(),
  isPending: false,
}));
jest.mock('hooks/files/useSyncFiles', () => ({
  useSyncFiles: () => mockSyncFiles,
}));
jest.mock('utils/locationTools', () => ({
  geocode: (address: string) => mockGeocode(address),
}));

const deferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const imageFile = (name: string) =>
  ({
    name,
    base64: `data:image/png;base64,${name}`,
    remote: false,
  } as UploadFile);

const fileData = (id: string) =>
  ({ id, type: 'file', attributes: {}, relationships: {} } as IFileData);

const startSaveThenEdit = async (
  result: { current: ReturnType<typeof useEventForm> },
  edit: () => void
) => {
  const created = deferred<{ data: { id: string } }>();
  mockAddEvent.mockReturnValue(created.promise);

  let firstSave: Promise<void> | undefined;
  let secondSave: Promise<void> | undefined;
  act(() => {
    firstSave = result.current.save();
  });
  act(edit);
  act(() => {
    secondSave = result.current.save();
  });
  await act(async () => {
    created.resolve({ data: { id: 'event-1' } });
    await firstSave;
  });
  await act(() => secondSave ?? Promise.resolve());
};

const renderForm = () =>
  renderHook(() => useEventForm({ projectId: 'project-1' }));

describe('useEventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateEvent.mockResolvedValue({});
    mockAddEventImage.mockResolvedValue({ data: { id: 'image-1' } });
    mockDeleteEventImage.mockResolvedValue(undefined);
    mockSyncFiles.mockResolvedValue(undefined);
  });

  it('creates a new event once when saved twice, then saves the edits made meanwhile', async () => {
    const created = deferred<{ data: { id: string } }>();
    mockAddEvent.mockReturnValue(created.promise);
    const { result } = renderForm();

    let firstSave: Promise<void> | undefined;
    let secondSave: Promise<void> | undefined;
    act(() => {
      firstSave = result.current.save();
    });
    act(() => {
      result.current.updateAttributes({ title_multiloc: { en: 'Edited' } });
    });
    act(() => {
      secondSave = result.current.save();
    });

    await act(async () => {
      created.resolve({ data: { id: 'event-1' } });
      await firstSave;
    });
    await act(() => secondSave ?? Promise.resolve());

    expect(mockAddEvent).toHaveBeenCalledTimes(1);
    expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
    expect(mockUpdateEvent).toHaveBeenCalledWith({
      eventId: 'event-1',
      event: expect.objectContaining({ title_multiloc: { en: 'Edited' } }),
    });
    expect(result.current.dirty).toBe(false);
  });

  it('stays unsaved when edited during a save', async () => {
    const created = deferred<{ data: { id: string } }>();
    mockAddEvent.mockReturnValue(created.promise);
    const { result } = renderForm();

    let save: Promise<void> | undefined;
    act(() => {
      save = result.current.save();
    });
    act(() => {
      result.current.updateAttributes({ title_multiloc: { en: 'Edited' } });
    });

    await act(async () => {
      created.resolve({ data: { id: 'event-1' } });
      await save;
    });

    expect(result.current.dirty).toBe(true);
  });

  it('saves the point of an address changed just before saving', async () => {
    const point: GeoJSON.Point = { type: 'Point', coordinates: [4.35, 50.85] };
    mockGeocode.mockResolvedValue(point);
    mockAddEvent.mockResolvedValue({ data: { id: 'event-1' } });
    const { result } = renderForm();

    act(() => {
      result.current.updateAttributes({ address_1: 'Grand-Place 1' });
    });
    await act(() => result.current.save());

    expect(mockGeocode).toHaveBeenCalledWith('Grand-Place 1');
    expect(mockAddEvent).toHaveBeenCalledWith({
      projectId: 'project-1',
      event: expect.objectContaining({ location_point_geojson: point }),
    });
  });

  it('sends an image chosen during a save with the next save', async () => {
    const { result } = renderForm();

    await startSaveThenEdit(result, () =>
      result.current.addImage([imageFile('new')])
    );

    expect(mockAddEventImage).toHaveBeenCalledTimes(1);
    expect(mockAddEventImage).toHaveBeenCalledWith({
      eventId: 'event-1',
      image: { image: 'data:image/png;base64,new' },
    });
  });

  it('replaces the image the previous save added', async () => {
    mockAddEvent.mockResolvedValue({ data: { id: 'event-1' } });
    const { result } = renderForm();

    act(() => result.current.addImage([imageFile('first')]));
    await act(() => result.current.save());
    act(() => result.current.addImage([imageFile('second')]));
    await act(() => result.current.save());

    expect(mockDeleteEventImage).toHaveBeenCalledWith({
      eventId: 'event-1',
      imageId: 'image-1',
    });
  });

  it('does not attach a file twice when another one arrives during a save', async () => {
    const { result } = renderForm();
    act(() => result.current.files.attachFile(fileData('file-1')));

    await startSaveThenEdit(result, () =>
      result.current.files.attachFile(fileData('file-2'))
    );

    const sentFileIds = mockSyncFiles.mock.calls.map(([{ fileAttachments }]) =>
      fileAttachments.map(
        (attachment: { relationships: { file: { data: { id: string } } } }) =>
          attachment.relationships.file.data.id
      )
    );
    expect(sentFileIds).toEqual([['file-1'], ['file-2']]);
  });
});
