import React, { useState, useEffect } from 'react';

// components
import {
  Box,
  Image as ImageComponent,
  Input,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// image upload
import { addContentBuilderImage } from 'modules/commercial/content_builder/services/contentBuilderImages';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// craft
import { useNode } from '@craftjs/core';
import messages from '../../../messages';

// intl
import { injectIntl } from 'utils/cl-intl';

const Image = ({
  imageUrl,
  alt = '',
  dataCode,
}: {
  imageUrl?: string;
  alt: string;
  dataCode?: string;
}) => {
  return (
    <Box style={{ pointerEvents: 'none' }} minHeight="26px">
      {imageUrl && (
        <ImageComponent
          width="100%"
          src={imageUrl}
          alt={alt}
          data-code={dataCode}
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
        const imageFile = await convertUrlToUploadFile(imageUrl);
        if (imageFile) {
          setImageFiles([imageFile]);
        }
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
      props.imageUrl = undefined;
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
        acceptedFileTypes="image/jpg, image/jpeg, image/png"
        onAdd={handleOnAdd}
        onRemove={handleOnRemove}
      />
      <Box mb="12px" />
      {imageFiles.length > 0 && (
        <Input
          type="text"
          id="imageAltTextInput"
          onChange={handleChange}
          value={alt}
          label={
            <span>
              {formatMessage(messages.imageAltTextLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.imageAltTextTooltip)}
              />
            </span>
          }
        />
      )}
    </Box>
  );
});

Image.craft = {
  props: {
    imageUrl: '',
  },
  related: {
    settings: ImageSettings,
  },
};

export default Image;
