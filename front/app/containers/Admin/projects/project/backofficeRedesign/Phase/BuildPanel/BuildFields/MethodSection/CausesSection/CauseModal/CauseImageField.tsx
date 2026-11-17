import React, { useState } from 'react';

import { useController } from 'react-hook-form';
import { UploadFile } from 'typings';

import Banner from 'design-system/Banner';
import DropZone from 'design-system/DropZone';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import { CauseFormValues } from 'containers/Admin/projects/project/volunteering/useCauseForm';

import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile } from 'utils/fileUtils';

import ImageFileRow from '../../../../../../Event/ImageFileRow';

import styles from './CauseModal.module.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE_MB = 10;

const CauseImageField = () => {
  const { formatMessage } = useIntl();
  const { field } = useController<CauseFormValues, 'image'>({ name: 'image' });
  const [tooLarge, setTooLarge] = useState(false);
  const image = field.value?.[0];
  const label = formatMessage(volunteeringMessages.causeImageLabel);

  const setImage = (images: UploadFile[]) => field.onChange(images);
  const removeImage = () => field.onChange([]);

  const addFile = async ([file]: File[]) => {
    const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1000000;
    setTooLarge(isTooLarge);
    if (isTooLarge) return;

    const base64 = await getBase64FromFile(file);
    setImage([
      Object.assign(file, {
        base64,
        url: base64,
        remote: false,
        filename: file.name,
      }),
    ]);
  };

  return (
    <div className={styles.imageField}>
      <span className={styles.label}>{label}</span>
      {image ? (
        <ImageFileRow
          image={image}
          thumbnail={image.base64}
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
            maxFileSize: MAX_FILE_SIZE_MB,
          })}
        </Banner>
      )}
    </div>
  );
};

export default CauseImageField;
