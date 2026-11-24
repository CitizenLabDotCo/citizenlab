import { useEffect, useRef, useState } from 'react';

import { Multiloc, UploadFile } from 'typings';

import useAddEventImage from 'api/event_images/useAddEventImage';
import useDeleteEventImage from 'api/event_images/useDeleteEventImage';
import useEventImage from 'api/event_images/useEventImage';
import useUpdateEventImage from 'api/event_images/useUpdateEventImage';
import { IEvent } from 'api/events/types';

import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Options {
  event?: IEvent;
  markDirty: () => void;
}

const useEventFormImage = ({ event, markDirty }: Options) => {
  const { data: remoteImage } = useEventImage(event?.data);
  const { mutateAsync: addEventImage } = useAddEventImage();
  const { mutateAsync: updateEventImage } = useUpdateEventImage();
  const { mutateAsync: deleteEventImage } = useDeleteEventImage();

  const [localImage, setLocalImage] = useState<UploadFile | null>();
  const [remoteImageFile, setRemoteImageFile] = useState<UploadFile | null>(
    null
  );
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState<Multiloc | null>();
  // Undefined until this form saves an image change.
  const savedImageId = useRef<string | null>();

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
    } else if (altText && imageId) {
      await updateEventImage({
        eventId: savedEventId,
        imageId,
        image: { alt_text_multiloc: altText },
      });
    }

    // Keep an image or alt text chosen during the save for the next one.
    setLocalImage((current) => (current === localImage ? undefined : current));
    setAltText((current) => (current === altText ? undefined : current));
  };

  return {
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
    saveImage,
  };
};

export default useEventFormImage;
