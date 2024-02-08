import React, { useState, useEffect } from 'react';

// react hook form
import { useFormContext } from 'react-hook-form';

// components
import { Box, Button, Icon, Input } from '@citizenlab/cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Locale, UploadFile } from 'typings';

// utils
import { generateTempId } from '../utils';
import { ICustomFieldInputType } from 'api/custom_fields/types';
import useAddCustomFieldOptionImage from 'api/content_field_option_images/useAddCustomFieldOptionImage';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// api
import useCustomFieldOptionImage from 'api/content_field_option_images/useCustomFieldOptionImage';

// TODO: CLean up these types
interface Props {
  index: number;
  choice: any;
  inputType: ICustomFieldInputType;
  canDeleteLastOption: boolean;
  locale: Locale;
  name: string;
  removeOption: (value, name: string, index: number) => void;
  choices: any[];
}

const SelectFieldOption = ({
  choice,
  index,
  inputType,
  canDeleteLastOption,
  locale,
  name,
  removeOption,
  choices,
}: Props) => {
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const { formatMessage } = useIntl();
  const showImageSettings = inputType === 'multiselect_image' && !choice.other;
  const { mutateAsync: addCustomFieldOptionImage } =
    useAddCustomFieldOptionImage();
  const { setValue, trigger } = useFormContext();

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
      const response = await addCustomFieldOptionImage(imageFiles[0].base64);

      const updatedChoices = choices;
      updatedChoices[index].image_id = response.data.id;
      if (!updatedChoices[index].id && !updatedChoices[index].temp_id) {
        updatedChoices[index].temp_id = generateTempId();
      }

      setValue(name, updatedChoices);
    } catch {
      // Do nothing for now
    }
  };

  const handleOnRemoveImage = () => {
    choices[index].image_id = '';
    setValue(name, choices);
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
            const updatedChoices = choices;
            updatedChoices[index].title_multiloc[locale] = value;
            if (!updatedChoices[index].id && !updatedChoices[index].temp_id) {
              updatedChoices[index].temp_id = generateTempId();
            }
            setValue(name, updatedChoices);
          }}
        />

        {showImageSettings && (
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
      {canDeleteLastOption && (
        <Button
          margin="0px"
          padding="0px"
          buttonStyle="text"
          aria-label={formatMessage(messages.removeAnswer)}
          onClick={() => {
            removeOption(choices, name, index);
            trigger();
          }}
        >
          <Icon name="delete" fill="coolGrey600" padding="0px" />
        </Button>
      )}
    </>
  );
};

export default SelectFieldOption;
