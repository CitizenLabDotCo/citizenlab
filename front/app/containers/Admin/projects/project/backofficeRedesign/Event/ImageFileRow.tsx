import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { UploadFile } from 'typings';

import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import Banner from 'design-system/Banner';
import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import styles from './ImageFileRow.module.css';
import {
  ACCEPTED_IMAGE_TYPES,
  isImageTooLarge,
  MAX_IMAGE_FILE_SIZE_MB,
  toUploadFile,
} from './imageUpload';
import messages from './messages';
import 'design-system/tokens.css';

interface Dimensions {
  width: number;
  height: number;
}

interface Props {
  image: UploadFile;
  thumbnail: string;
  onCrop?: () => void;
  onReplace: (image: UploadFile) => void;
  onRemove: () => void;
  stackActions?: boolean;
}

const ImageFileRow = ({
  image,
  thumbnail,
  onCrop,
  onReplace,
  onRemove,
  stackActions = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [tooLarge, setTooLarge] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () =>
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = image.base64;
    return () => {
      img.onload = null;
    };
  }, [image.base64]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const isTooLarge = isImageTooLarge(file);
    setTooLarge(isTooLarge);
    if (isTooLarge) return;

    onReplace(await toUploadFile(file));
  };

  const actions = (
    <div className={stackActions ? styles.stackedActions : styles.actions}>
      {onCrop && (
        <IconButton
          icon="pencil-14"
          aria-label={formatMessage(messages.cropImage)}
          onPress={onCrop}
        />
      )}
      <IconButton
        icon="upload-16"
        aria-label={formatMessage(messages.replaceImage)}
        onPress={() => inputRef.current?.click()}
      />
      <IconButton
        icon="trash-2-16"
        aria-label={formatMessage(messages.deleteImage)}
        onPress={onRemove}
      />
    </div>
  );

  return (
    <div className={styles.fileRow}>
      <div className={styles.row}>
        <div className={styles.thumbnail}>
          <img src={thumbnail} alt="" className={styles.thumbnailImage} />
        </div>
        <div className={styles.details}>
          <p className={styles.name} title={image.name}>
            {image.name}
          </p>
          <p className={styles.meta}>
            <span className={styles.nowrap}>{returnFileSize(image.size)}</span>
            {dimensions && (
              <>
                {' · '}
                <span className={styles.nowrap}>
                  {`${dimensions.width} × ${dimensions.height}`}
                </span>
              </>
            )}
          </p>
          {stackActions && actions}
        </div>
        {!stackActions && actions}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          hidden
          onChange={handleFileChange}
        />
      </div>
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

export default ImageFileRow;
