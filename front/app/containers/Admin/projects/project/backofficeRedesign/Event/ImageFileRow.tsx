import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import {
  Box,
  Image,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import Error from 'components/UI/Error';
import IconAction from 'components/UI/IconAction';
import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile, returnFileSize } from 'utils/fileUtils';

import messages from './messages';

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = 'image/jpeg,image/png';

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
}

const ImageFileRow = ({
  image,
  thumbnail,
  onCrop,
  onReplace,
  onRemove,
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

    const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1000000;
    setTooLarge(isTooLarge);
    if (isTooLarge) return;

    const base64 = await getBase64FromFile(file);
    onReplace(
      Object.assign(file, {
        base64,
        url: base64,
        remote: false,
        filename: file.name,
      })
    );
  };

  const meta = [
    returnFileSize(image.size),
    dimensions && `${dimensions.width} × ${dimensions.height}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Box display="flex" alignItems="center" gap="12px">
        <Box
          flex="0 0 96px"
          height="54px"
          overflow="hidden"
          borderRadius={stylingConsts.borderRadius}
          background={colors.grey100}
        >
          <Image
            src={thumbnail}
            alt=""
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
        </Box>
        <Box
          flex="1"
          minWidth="0"
          display="flex"
          flexDirection="column"
          gap="2px"
        >
          <Text
            variant="boControl"
            fontSize="xs"
            lineHeight="16px"
            m="0"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            title={image.name}
          >
            {image.name}
          </Text>
          <Text
            m="0"
            fontSize="xs"
            lineHeight="16px"
            color="coolGrey600"
            whiteSpace="nowrap"
          >
            {meta}
          </Text>
        </Box>
        <Box display="flex" gap="4px" mr="-4px">
          {onCrop && (
            <IconAction
              icon="edit"
              tooltip={formatMessage(messages.crop)}
              ariaLabel={formatMessage(messages.cropImage)}
              onClick={onCrop}
            />
          )}
          <IconAction
            icon="upload-file"
            tooltip={formatMessage(messages.replace)}
            ariaLabel={formatMessage(messages.replaceImage)}
            onClick={() => inputRef.current?.click()}
          />
          <IconAction
            icon="delete"
            tooltip={formatMessage(messages.delete)}
            ariaLabel={formatMessage(messages.deleteImage)}
            onClick={onRemove}
          />
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          hidden
          onChange={handleFileChange}
        />
      </Box>
      {tooLarge && (
        <Error
          text={formatMessage(
            imagesDropzoneMessages.errorImageMaxSizeExceeded,
            {
              maxFileSize: MAX_FILE_SIZE_MB,
            }
          )}
        />
      )}
    </Box>
  );
};

export default ImageFileRow;
