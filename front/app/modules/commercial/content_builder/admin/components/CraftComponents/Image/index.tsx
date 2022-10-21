import React, { useEffect, useState } from 'react';

// components
import {
  Box,
  colors,
  Icon,
  Image as ImageComponent,
  Input,
} from '@citizenlab/cl2-component-library';

// image upload
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { addContentBuilderImage } from 'modules/commercial/content_builder/services/contentBuilderImages';
import { UploadFile } from 'typings';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// craft
import { useEditor, useNode } from '@craftjs/core';
import messages from '../../../messages';

// intl
import { injectIntl } from 'utils/cl-intl';

// events
import { IMAGE_UPLOADING_EVENT } from 'modules/commercial/content_builder/admin/containers';
import eventEmitter from 'utils/eventEmitter';

const Image = ({
  imageUrl,
  alt = '',
  dataCode,
}: {
  imageUrl?: string;
  alt: string;
  dataCode?: string;
}) => {
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  return (
    <Box
      width="100%"
      display="flex"
      id="e2e-image"
      style={{ pointerEvents: 'none' }}
      minHeight="26px"
    >
      {imageUrl && (
        <ImageComponent
          width="100%"
          src={imageUrl}
          alt={alt}
          data-code={dataCode}
        />
      )}
      {/* In edit view, show an image placeholder if image is not set. */}
      {!imageUrl && enabled && (
        <Icon
          margin="auto"
          padding="24px"
          width="100px"
          height="100px"
          fill={colors.grey500}
          name="image"
        />
      )}
    </Box>
  );
};

const ImageSettings = injectIntl(({ intl: { formatMessage } }) => {
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const {
    actions: { setProp },
    imageUrl,
    alt,
  } = useNode((node) => ({
    imageUrl: node.data.props.imageUrl,
    alt: node.data.props.alt,
  }));

  useEffect(() => {
    if (imageUrl) {
      (async () => {
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);
        const imageFile = await convertUrlToUploadFile(imageUrl);
        if (imageFile) {
          setImageFiles([imageFile]);
        }
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
      })();
    }
  }, [imageUrl]);

  const handleOnAdd = async (imageFiles: UploadFile[]) => {
    setImageFiles(imageFiles);

    try {
      const response = await addContentBuilderImage(imageFiles[0].base64);
      setProp((props) => {
        props.dataCode = response.data.attributes.code;
        props.imageUrl = response.data.attributes.image_url;
      });
    } catch {
      // Do nothing
    }
  };

  const handleOnRemove = () => {
    setProp((props) => {
      props.imageUrl = '';
      props.dataCode = undefined;
      props.alt = '';
    });
    setImageFiles([]);
  };

  const handleChange = (value: string) => {
    setProp((props) => (props.alt = value));
  };

  return (
    <Box marginBottom="20px">
      <ImagesDropzone
        images={imageFiles}
        imagePreviewRatio={1 / 2}
        maxImagePreviewWidth="360px"
        objectFit="contain"
        acceptedFileTypes={{
          'image/*': ['.jpg', '.jpeg', '.png'],
        }}
        onAdd={handleOnAdd}
        onRemove={handleOnRemove}
      />
      <Box mb="12px" display={imageFiles.length > 0 ? 'block' : 'none'} />
      <Box mt="16px">
        <Input
          type="text"
          id="imageAltTextInput"
          onChange={handleChange}
          value={alt}
          labelTooltipText={formatMessage(messages.imageAltTextTooltip)}
          label={formatMessage(messages.imageAltTextLabel)}
        />
      </Box>
    </Box>
  );
});

Image.craft = {
  related: {
    settings: ImageSettings,
  },
};

export default Image;
