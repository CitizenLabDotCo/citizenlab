import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { CLErrors, Multiloc, UploadFile } from 'typings';

import useAddEventImage from 'api/event_images/useAddEventImage';
import useDeleteEventImage from 'api/event_images/useDeleteEventImage';
import useEventImage from 'api/event_images/useEventImage';
import useUpdateEventImage from 'api/event_images/useUpdateEventImage';
import { IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useEvent from 'api/events/useEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';
import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import { useSyncFiles } from 'hooks/files/useSyncFiles';

import { isCLErrorsWrapper } from 'utils/errorUtils';
import {
  convertUrlToUploadFile,
  generateTemporaryFileAttachment,
} from 'utils/fileUtils';
import { geocode } from 'utils/locationTools';

import { SubmitState } from './types';
import { initializeEventTimes } from './utils';

interface QueuedSave {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

const createQueuedSave = (): QueuedSave => {
  let resolve: () => void = () => {};
  let reject: (error: unknown) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

interface Options {
  projectId: string;
  /** Absent for an event that isn't created yet. */
  eventId?: string;
  onCreate?: (eventId: string) => void;
}

// The form state of an event. The values a user hasn't touched yet are
// `undefined`, so they fall back to the saved event.
const useEventForm = ({ projectId, eventId, onCreate }: Options) => {
  const [createdEventId, setCreatedEventId] = useState<string>();
  const currentEventId = eventId ?? createdEventId;

  const { data: event, isLoading } = useEvent(currentEventId);
  const { data: savedAttachments } = useFileAttachments({
    attachable_id: currentEventId,
    attachable_type: 'Event',
  });
  const { data: remoteImage } = useEventImage(event?.data);

  const { mutateAsync: addEvent } = useAddEvent();
  const { mutateAsync: updateEvent } = useUpdateEvent();
  const { mutateAsync: addEventImage } = useAddEventImage();
  const { mutateAsync: updateEventImage } = useUpdateEventImage();
  const { mutateAsync: deleteEventImage } = useDeleteEventImage();
  const { mutate: addFile, isPending: isUploadingFile } = useAddFile();
  const syncFiles = useSyncFiles();

  const [status, setStatus] = useState<SubmitState>('disabled');
  const [saving, setSaving] = useState(false);
  const pendingSave = useRef<Promise<void> | null>(null);
  const queuedSave = useRef<QueuedSave | null>(null);
  const editCount = useRef(0);
  const savedEditCount = useRef(0);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>(() =>
    eventId ? {} : initializeEventTimes()
  );
  const [customButtonToggle, setCustomButtonToggle] = useState<boolean>();
  const [localImage, setLocalImage] = useState<UploadFile | null>();
  const [remoteImageFile, setRemoteImageFile] = useState<UploadFile | null>(
    null
  );
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState<Multiloc | null>();
  const [locationPoint, setLocationPoint] = useState<GeoJSON.Point | null>();
  const [geocodedPoint, setGeocodedPoint] = useState<GeoJSON.Point | null>(
    null
  );
  const geocodedAddress = useRef<string | null>();
  // Undefined until this form saves an image change.
  const savedImageId = useRef<string | null>();
  const markDirty = () => {
    editCount.current += 1;
    setStatus('enabled');
    setErrors(null);
  };

  const [stagedAttachments, setStagedAttachments] =
    useState<IFileAttachmentData[]>();
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<
    IFileAttachmentData[]
  >([]);
  const attachments = stagedAttachments ?? savedAttachments?.data ?? [];

  const stageAttachments = (
    update: (current: IFileAttachmentData[]) => IFileAttachmentData[]
  ) => {
    markDirty();
    setStagedAttachments((staged) =>
      update(staged ?? savedAttachments?.data ?? [])
    );
  };

  const attachFile = (file: IFileData) =>
    stageAttachments((current) =>
      current.some(
        (attachment) => attachment.relationships.file.data.id === file.id
      )
        ? current
        : [
            ...current,
            generateTemporaryFileAttachment({
              fileId: file.id,
              attachableId: currentEventId,
              attachableType: 'Event',
              position: current.length,
            }),
          ]
    );

  const uploadFile = (fileToAdd: UploadFile) =>
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other',
        ai_processing_allowed: false,
      },
      { onSuccess: (newFile) => attachFile(newFile.data) }
    );

  const removeFile = (attachmentToRemove: IFileAttachmentData) => {
    stageAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentToRemove.id)
    );
    setAttachmentsToRemove((toRemove) => [...toRemove, attachmentToRemove]);
  };

  const reorderFiles = (reordered: IFileAttachmentData[]) =>
    stageAttachments(() =>
      reordered.map((attachment, position) => ({
        ...attachment,
        attributes: { ...attachment.attributes, position },
      }))
    );

  const saveAttachments = async (savedEventId: string) => {
    if (!stagedAttachments) return;

    await syncFiles({
      attachableId: savedEventId,
      attachableType: 'Event',
      fileAttachments: stagedAttachments,
      fileAttachmentsToRemove: attachmentsToRemove,
      fileAttachmentOrdering: Object.fromEntries(
        (savedAttachments?.data ?? []).map((attachment) => [
          attachment.id,
          attachment.attributes.position,
        ])
      ),
    });
    // An upload that finishes during the save is staged on top of what was
    // sent. Keep it, but drop what was sent, or the next save adds it again.
    const sent = new Set(
      [
        ...stagedAttachments.filter(({ id }) => id.startsWith('TEMP-')),
        ...attachmentsToRemove,
      ].map(({ id }) => id)
    );
    setStagedAttachments((staged) =>
      staged === stagedAttachments
        ? undefined
        : staged?.filter(({ id }) => !sent.has(id))
    );
    setAttachmentsToRemove((toRemove) =>
      toRemove.filter(({ id }) => !sent.has(id))
    );
  };

  const savedAttributes = event?.data.attributes;
  const attributes = { ...savedAttributes, ...attributeDiff };
  const savedPoint = savedAttributes?.location_point_geojson ?? null;
  const remoteImageUrl = remoteImage?.data.attributes.versions.medium;

  useEffect(() => {
    if (!remoteImageUrl) {
      setRemoteImageFile(null);
      return;
    }

    let cancelled = false;
    convertUrlToUploadFile(remoteImageUrl).then((file) => {
      if (!cancelled) setRemoteImageFile(file);
    });
    return () => {
      cancelled = true;
    };
  }, [remoteImageUrl]);

  const changedAddress = attributeDiff.address_1;
  useEffect(() => {
    if (
      changedAddress === undefined ||
      geocodedAddress.current === changedAddress
    ) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (geocodedAddress.current === changedAddress) return;
      const point = changedAddress ? await geocode(changedAddress) : null;
      if (cancelled || geocodedAddress.current === changedAddress) return;
      geocodedAddress.current = changedAddress;
      setGeocodedPoint(point);
      setLocationPoint(point);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [changedAddress]);

  // Saving right after an address change must not wait for the delayed
  // lookup above, or the event is saved with the previous point.
  const locationPointToSave = async () => {
    if (
      changedAddress === undefined ||
      geocodedAddress.current === changedAddress
    ) {
      return locationPoint;
    }

    const point = changedAddress ? await geocode(changedAddress) : null;
    geocodedAddress.current = changedAddress;
    setGeocodedPoint(point);
    setLocationPoint(point);
    return point;
  };

  const updateAttributeDiff: Dispatch<SetStateAction<IEventProperties>> = (
    update
  ) => {
    markDirty();
    setAttributeDiff(update);
  };

  const updateAttributes = (changes: IEventProperties) =>
    updateAttributeDiff((diff) => ({ ...diff, ...changes }));

  const registrationLimitOn = typeof attributes.maximum_attendees === 'number';
  const customButtonOn = customButtonToggle ?? !!attributes.using_url;
  const image = localImage === undefined ? remoteImageFile : localImage;
  const imageAltText =
    altText === undefined
      ? remoteImage?.data.attributes.alt_text_multiloc ?? null
      : altText;

  const saveImage = async (savedEventId: string) => {
    // The loaded event lags behind this form's own saves, so a save that runs
    // right after another works on the image that one left.
    const imageId =
      savedImageId.current === undefined
        ? event?.data.relationships.event_images.data.at(0)?.id
        : savedImageId.current;

    if (localImage !== undefined) {
      if (imageId) {
        await deleteEventImage({ eventId: savedEventId, imageId });
        savedImageId.current = null;
      }
      if (localImage && croppedImage) {
        const added = await addEventImage({
          eventId: savedEventId,
          image: {
            image: croppedImage,
            ...(imageAltText ? { alt_text_multiloc: imageAltText } : {}),
          },
        });
        savedImageId.current = added.data.id;
      }
    } else if (altText && imageId && image) {
      await updateEventImage({
        eventId: savedEventId,
        imageId,
        image: { image: image.base64, alt_text_multiloc: altText },
      });
    }

    // Keep an image or alt text chosen during the save for the next one.
    setLocalImage((current) => (current === localImage ? undefined : current));
    setAltText((current) => (current === altText ? undefined : current));
  };

  // Two saves at once would create a new event twice, so a save asked for
  // while another runs is queued until that one ends.
  const save = () => {
    if (!pendingSave.current) {
      pendingSave.current = saveChanges();
      return pendingSave.current;
    }
    queuedSave.current ??= createQueuedSave();
    return queuedSave.current.promise;
  };

  // The queued save runs only after the re-render that follows the first
  // save, so it reads the state that save left behind, like the id of the
  // event it created.
  useEffect(() => {
    const queued = queuedSave.current;
    if (saving || pendingSave.current || !queued) return;

    queuedSave.current = null;
    if (editCount.current === savedEditCount.current) {
      queued.resolve();
    } else {
      save().then(queued.resolve, queued.reject);
    }
  });

  const saveChanges = async () => {
    setSaving(true);
    setErrors(null);
    const editsAtStart = editCount.current;

    try {
      const point = await locationPointToSave();
      const changes: IEventProperties = {
        ...attributeDiff,
        ...(point !== undefined && {
          location_point_geojson: attributes.address_1 ? point : null,
        }),
      };

      let savedEventId = currentEventId;
      if (!savedEventId) {
        savedEventId = (await addEvent({ projectId, event: changes })).data.id;
        setCreatedEventId(savedEventId);
        onCreate?.(savedEventId);
      } else if (Object.keys(changes).length > 0) {
        // Only the image or files may have changed, and the API refuses an
        // empty update.
        await updateEvent({ eventId: savedEventId, event: changes });
      }

      await Promise.all([
        saveAttachments(savedEventId),
        saveImage(savedEventId),
      ]);

      savedEditCount.current = editsAtStart;
      // Edits made during the save weren't sent, so the form stays unsaved.
      if (editCount.current === editsAtStart) setStatus('success');
    } catch (error) {
      setErrors(
        isCLErrorsWrapper(error)
          ? error.errors
          : { base: [{ error: 'unknown' }] }
      );
      setStatus('error');
      throw error;
    } finally {
      pendingSave.current = null;
      setSaving(false);
    }
  };

  return {
    event: event?.data,
    // Only the first load of an existing event; loading the event just
    // created must not unmount the form.
    isLoading: !!eventId && isLoading,
    attributes,
    errors,
    status,
    saving,
    dirty: status === 'enabled' || status === 'error',
    save,
    updateAttributes,
    updateAttributeDiff,

    registrationLimitOn,
    toggleRegistrationLimit: () =>
      updateAttributes({ maximum_attendees: registrationLimitOn ? null : 100 }),
    // An empty field counts as 0.
    setMaximumAttendees: (value: string) =>
      updateAttributes({ maximum_attendees: Number(value) }),
    customButtonOn,
    toggleCustomButton: () => {
      setCustomButtonToggle(!customButtonOn);
      updateAttributes({ using_url: '' });
    },

    image,
    croppedImage,
    imageAltText,
    imageNeedsCrop: !!image && !image.remote,
    addImage: (images: UploadFile[]) => {
      markDirty();
      setLocalImage(images[0]);
      setCroppedImage(images[0].base64);
    },
    removeImage: () => {
      markDirty();
      setLocalImage(null);
    },
    cropImage: setCroppedImage,
    changeImageAltText: (altText: Multiloc) => {
      markDirty();
      setAltText(altText);
    },

    hasLocationPoint: !!(locationPoint === undefined
      ? savedPoint
      : locationPoint),
    mapPosition: geocodedPoint ?? savedPoint,
    moveLocationPoint: (point: GeoJSON.Point) => {
      markDirty();
      setLocationPoint(point);
    },

    files: {
      attachments,
      isUploadingFile,
      attachFile,
      uploadFile,
      removeFile,
      reorderFiles,
    },
  };
};

export type EventForm = ReturnType<typeof useEventForm>;

export default useEventForm;
