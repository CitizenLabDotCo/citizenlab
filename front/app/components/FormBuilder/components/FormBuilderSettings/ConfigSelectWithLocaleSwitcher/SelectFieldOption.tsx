import React, { useState, useEffect, memo } from 'react';

// components
import {
  Box,
  Button,
  Icon,
  Input,
  Spinner,
} from '@citizenlab/cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Locale, UploadFile } from 'typings';

// utils
import { ICustomFieldInputType, IOptionsType } from 'api/custom_fields/types';
import useAddCustomFieldOptionImage from 'api/content_field_option_images/useAddCustomFieldOptionImage';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// api
import useCustomFieldOptionImage from 'api/content_field_option_images/useCustomFieldOptionImage';

interface Props {
  index: number;
  choice: IOptionsType;
  inputType: ICustomFieldInputType;
  canDeleteLastOption: boolean;
  locale: Locale;
  removeOption: (index: number) => void;
  onChoiceUpdate: (choice: IOptionsType, index: number) => void;
}

const SelectFieldOption = memo(
  ({
    choice,
    index,
    inputType,
    canDeleteLastOption,
    locale,
    removeOption,
    onChoiceUpdate,
  }: Props) => {
    const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { formatMessage } = useIntl();
    const showImageSettings =
      inputType === 'multiselect_image' && !choice.other;
    const { mutateAsync: addCustomFieldOptionImage } =
      useAddCustomFieldOptionImage();

    const image = useCustomFieldOptionImage({
      imageId: choice.image_id,
    });

    useEffect(() => {
      const imageUrl = image.data?.data.attributes.versions.medium;

      if (imageUrl) {
        (async () => {
          const imageFile = await convertUrlToUploadFile(imageUrl);
          if (imageFile) {
            setImageFiles([imageFile]);
          }
        })();
      }
    }, [image.data?.data.attributes.versions.medium]);

    const handleOnAddImage = async (imageFiles: UploadFile[]) => {
      setImageFiles(imageFiles);
      try {
        setIsUploading(true);
        const response = await addCustomFieldOptionImage(imageFiles[0].base64);

        onChoiceUpdate(
          {
            ...choice,
            image_id: response.data.id,
          } as IOptionsType,
          index
        );
      } catch {
        // Do nothing for now
      } finally {
        setIsUploading(false);
      }
    };

    const handleOnRemoveImage = () => {
      onChoiceUpdate(
        {
          ...choice,
          image_id: '',
        } as IOptionsType,
        index
      );
      setImageFiles([]);
    };

    const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
      // We want to prevent the form builder from being closed when enter is pressed
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    };

    return (
      <>
        <Box width="100%" pl={choice.other === true ? '30px' : '0'}>
          <Input
            id={`e2e-option-input-${index}`}
            size="small"
            type="text"
            value={choice.title_multiloc[locale]}
            onKeyDown={handleKeyDown}
            onChange={(value) => {
              choice.title_multiloc[locale] = value;
              onChoiceUpdate(choice, index);
            }}
          />

          {showImageSettings && (
            <Box
              display="flex"
              w="100%"
              h="100%"
              alignItems="center"
              justifyContent="center"
              mt="12px"
            >
              {isUploading ? (
                <Box p="16px">
                  <Spinner />
                </Box>
              ) : (
                <ImagesDropzone
                  id={`e2e-option-image-${index}`}
                  images={imageFiles}
                  imagePreviewRatio={135 / 298}
                  acceptedFileTypes={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                  }}
                  onAdd={handleOnAddImage}
                  onRemove={handleOnRemoveImage}
                />
              )}
            </Box>
          )}
        </Box>

        {canDeleteLastOption && (
          <Button
            margin="0px"
            padding="0px"
            buttonStyle="text"
            aria-label={formatMessage(messages.removeAnswer)}
            onClick={() => {
              removeOption(index);
            }}
          >
            <Icon name="delete" fill="coolGrey600" padding="0px" />
          </Button>
        )}
      </>
    );
  }
);

export default SelectFieldOption;
