import React, { useState } from 'react';

import { useController } from 'react-hook-form';
import { UploadFile } from 'typings';

import Banner from 'design-system/Banner';
import DropZone from 'design-system/DropZone';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import { CauseFormValues } from 'containers/Admin/projects/project/volunteering/useCauseForm';

import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import { useIntl } from 'utils/cl-intl';

import ImageFileRow from '../../../../../../Event/ImageFileRow';
import {
  ACCEPTED_IMAGE_TYPES,
  isImageTooLarge,
  MAX_IMAGE_FILE_SIZE_MB,
  toUploadFile,
} from '../../../../../../Event/imageUpload';

import styles from './CauseModal.module.css';

const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, 'image/gif'];

const CauseImageField = () => {
  const { formatMessage } = useIntl();
  const { field } = useController<CauseFormValues, 'image'>({ name: 'image' });
  const [tooLarge, setTooLarge] = useState(false);
  const image = field.value?.[0];
  const label = formatMessage(volunteeringMessages.causeImageLabel);

  const setImage = (images: UploadFile[]) => field.onChange(images);
  const removeImage = () => field.onChange([]);

  const addFile = async (files: File[]) => {
    const file = files.at(0);
    if (!file) return;

    const isTooLarge = isImageTooLarge(file);
    setTooLarge(isTooLarge);
    if (isTooLarge) return;

    setImage([await toUploadFile(file)]);
  };

  return (
    <div className={styles.imageField}>
      <span className={styles.label}>{label}</span>
      {image ? (
        <ImageFileRow
          image={image}
          thumbnail={image.base64}
          acceptedFileTypes={ACCEPTED_TYPES}
          onReplace={(newImage) => setImage([newImage])}
          onRemove={removeImage}
        />
      ) : (
        <DropZone
          aria-label={label}
          acceptedFileTypes={ACCEPTED_TYPES}
          onSelect={addFile}
        />
      )}
      {tooLarge && (
        <Banner tone="error">
          {formatMessage(imagesDropzoneMessages.errorImageMaxSizeExceeded, {
            maxFileSize: MAX_IMAGE_FILE_SIZE_MB,
          })}
        </Banner>
      )}
    </div>
  );
};

export default CauseImageField;
