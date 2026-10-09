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

interface Options {
  projectId: string;
  /** Absent for an event that isn't created yet. */
  eventId?: string;
}

// The form state of an event. The values a user hasn't touched yet are
// `undefined`, so they fall back to the saved event.
const useEventForm = ({ projectId, eventId }: Options) => {
  const { data: event, isLoading } = useEvent(eventId);
  const { data: savedAttachments } = useFileAttachments({
    attachable_id: eventId,
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
  // A new event is created once: saving again updates it.
  const createdEventId = useRef<string>();

  const markDirty = () => {
    setStatus('enabled');
    setErrors(null);
  };

  // Attachment changes wait here until the event is saved.
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
              attachableId: eventId,
              attachableType: 'Event',
              position: current.length,
            }),
          ]
    );

  // Uploads to the project's files first, so the attachment can point to it.
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
    setStagedAttachments(undefined);
    setAttachmentsToRemove([]);
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

  // A changed address moves the map pin to it, once the typing stops.
  const changedAddress = attributeDiff.address_1;
  useEffect(() => {
    if (changedAddress === undefined) return;

    const timeout = setTimeout(async () => {
      const point = changedAddress ? await geocode(changedAddress) : null;
      setGeocodedPoint(point);
      setLocationPoint(point);
    }, 500);
    return () => clearTimeout(timeout);
  }, [changedAddress]);

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
    const remoteImageId = event?.data.relationships.event_images.data.at(0)?.id;

    if (localImage !== undefined) {
      if (remoteImageId) {
        await deleteEventImage({
          eventId: savedEventId,
          imageId: remoteImageId,
        });
      }
      if (localImage && croppedImage) {
        await addEventImage({
          eventId: savedEventId,
          image: {
            image: croppedImage,
            ...(imageAltText ? { alt_text_multiloc: imageAltText } : {}),
          },
        });
      }
    } else if (altText && remoteImageId && image) {
      await updateEventImage({
        eventId: savedEventId,
        imageId: remoteImageId,
        image: { image: image.base64, alt_text_multiloc: altText },
      });
    }

    setLocalImage(undefined);
    setAltText(undefined);
  };

  const save = async () => {
    setSaving(true);
    setErrors(null);

    const changes: IEventProperties = {
      ...attributeDiff,
      ...(locationPoint !== undefined && {
        location_point_geojson: attributes.address_1 ? locationPoint : null,
      }),
    };
    const existingEventId = eventId ?? createdEventId.current;

    try {
      let savedEventId = existingEventId;
      if (!savedEventId) {
        savedEventId = (await addEvent({ projectId, event: changes })).data.id;
        createdEventId.current = savedEventId;
      } else if (Object.keys(changes).length > 0) {
        // Only the image or files may have changed, and the API refuses an
        // empty update.
        await updateEvent({ eventId: savedEventId, event: changes });
      }

      await Promise.all([
        saveAttachments(savedEventId),
        saveImage(savedEventId),
      ]);

      setStatus('success');
    } catch (error) {
      setErrors(
        isCLErrorsWrapper(error)
          ? error.errors
          : { base: [{ error: 'unknown' }] }
      );
      setStatus('error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    event: event?.data,
    isLoading,
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
