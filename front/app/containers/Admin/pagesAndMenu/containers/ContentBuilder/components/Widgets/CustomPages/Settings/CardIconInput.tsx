import React, { useState } from 'react';

import {
  Box,
  Button,
  Image,
  Label,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';

import { IMAGE_UPLOADING_EVENT } from 'components/admin/ContentBuilder/constants';
import EmojiPickerInput from 'components/UI/EmojiPicker';
import Error from 'components/UI/Error';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Tabs from 'components/UI/Tabs';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import { CARD_ICON_SIZE } from '../constants';
import messages from '../messages';
import tracks from '../tracks';
import { CustomPageIconImage } from '../typings';

// Square, so that it also communicates the expected proportions of the image.
const IMAGE_BOX_SIZE = '140px';

type IconType = 'emoji' | 'image';

interface Props {
  pageId: string;
  emoji: string | null;
  image: CustomPageIconImage | null;
  onChangeEmoji: (emoji: string | null) => void;
  onChangeImage: (image: CustomPageIconImage | null) => void;
}

const CardIconInput = ({
  pageId,
  emoji,
  image,
  onChangeEmoji,
  onChangeImage,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const [iconType, setIconType] = useState<IconType>(emoji ? 'emoji' : 'image');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);

  // Tab names end up as DOM ids, and there is one input per selected page, so
  // they have to be scoped to the page.
  const tabName = (type: IconType) => `${type}-icon-${pageId}`;

  // The picker reports clearing the emoji as a change too, which is not a
  // selection.
  const handleSelectEmoji = (selected: string | null) => {
    if (selected) {
      trackEventByName(tracks.cardEmojiSelected);
    }

    onChangeEmoji(selected);
  };

  const handleAddImage = async (uploadedFiles: UploadFile[]) => {
    setUploadFailed(false);
    setIsUploading(true);
    // Blocks saving the layout while the upload is in flight, so it can never be
    // persisted while the image it should point to still has no URL.
    eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);

    try {
      const response = await addContentBuilderImage(uploadedFiles[0].base64);
      onChangeImage({
        dataCode: response.data.attributes.code,
        imageUrl: response.data.attributes.image_url,
      });
      trackEventByName(tracks.cardImageSelected, {
        fileType: uploadedFiles[0].type,
      });
    } catch {
      setUploadFailed(true);
    } finally {
      setIsUploading(false);
      eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
    }
  };

  const renderImageInput = () => {
    if (image?.imageUrl) {
      return (
        <Box display="flex" alignItems="center" gap="12px">
          <Box
            flex="0 0 auto"
            w={IMAGE_BOX_SIZE}
            h={IMAGE_BOX_SIZE}
            p="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgColor={colors.white}
            border={`1px solid ${colors.borderDark}`}
            borderRadius={stylingConsts.borderRadius}
          >
            <Image
              src={image.imageUrl}
              alt={formatMessage(messages.iconPreviewAltText)}
              w="100%"
              h="100%"
              objectFit="contain"
            />
          </Box>
          <Button
            type="button"
            buttonStyle="text"
            icon="delete"
            p="0px"
            onClick={() => onChangeImage(null)}
          >
            {formatMessage(messages.removeImage)}
          </Button>
        </Box>
      );
    }

    if (isUploading) {
      return (
        <Box
          w={IMAGE_BOX_SIZE}
          h={IMAGE_BOX_SIZE}
          display="flex"
          alignItems="center"
          justifyContent="center"
          border={`1px dashed ${colors.borderDark}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <Spinner />
        </Box>
      );
    }

    return (
      <ImagesDropzone
        id={`card-icon-image-${pageId}`}
        images={[]}
        imagePreviewRatio={1}
        maxImagePreviewWidth={IMAGE_BOX_SIZE}
        objectFit="contain"
        label={formatMessage(messages.uploadImageLabel)}
        acceptedFileTypes={{ 'image/*': ['.svg', '.png', '.jpg', '.jpeg'] }}
        onAdd={handleAddImage}
        onRemove={() => onChangeImage(null)}
      />
    );
  };

  return (
    <Box>
      <Label>{formatMessage(messages.cardIcon)}</Label>
      <Box mb="16px">
        <Tabs
          items={[
            {
              name: tabName('image'),
              label: formatMessage(messages.imageTab),
              className: 'e2e-card-icon-image-tab',
            },
            {
              name: tabName('emoji'),
              label: formatMessage(messages.emojiTab),
              className: 'e2e-card-icon-emoji-tab',
            },
          ]}
          selectedValue={tabName(iconType)}
          onClick={(name) =>
            setIconType(name === tabName('image') ? 'image' : 'emoji')
          }
        />
      </Box>
      {iconType === 'emoji' ? (
        <EmojiPickerInput
          value={emoji}
          onChange={handleSelectEmoji}
          placement="top"
        />
      ) : (
        <>
          {renderImageInput()}
          <Text mt="8px" mb="0px" fontSize="s" color="textSecondary">
            {formatMessage(messages.imageInstructions, {
              size: CARD_ICON_SIZE,
            })}
          </Text>
          {uploadFailed && (
            <Error text={formatMessage(messages.imageUploadError)} />
          )}
        </>
      )}
    </Box>
  );
};

export default CardIconInput;
