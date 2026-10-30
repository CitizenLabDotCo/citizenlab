import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useController } from 'react-hook-form';
import { UploadFile } from 'typings';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';
import { CauseFormValues } from 'containers/Admin/projects/project/volunteering/useCauseForm';

import ImagesDropzone from 'components/UI/ImagesDropzone';

import { useIntl } from 'utils/cl-intl';

import ImageFileRow from '../../Event/ImageFileRow';
import messages from '../../messages';

const CauseImageField = () => {
  const { formatMessage } = useIntl();
  const { field } = useController<CauseFormValues, 'image'>({ name: 'image' });
  const image = field.value?.[0];

  const setImage = (images: UploadFile[]) => field.onChange(images);
  const removeImage = () => field.onChange([]);

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Text as="span" fontSize="xs" color="coolGrey600" m="0">
        {formatMessage(volunteeringMessages.causeImageLabel)}
      </Text>
      {image ? (
        <ImageFileRow
          image={image}
          thumbnail={image.base64}
          onReplace={(newImage) => setImage([newImage])}
          onRemove={removeImage}
        />
      ) : (
        <ImagesDropzone
          images={[]}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          onAdd={setImage}
          onRemove={removeImage}
          imagePreviewRatio={1 / 3}
          label={formatMessage(messages.causeImageDrop)}
          compact
        />
      )}
    </Box>
  );
};

export default CauseImageField;
