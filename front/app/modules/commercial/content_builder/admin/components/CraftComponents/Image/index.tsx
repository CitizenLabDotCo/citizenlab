import React, { useState, useEffect } from 'react';

// components
import {
  Box,
  Image as ImageComponent,
  Input,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// image upload
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// craft
import { useNode } from '@craftjs/core';

const Image = ({ imageUrl, alt = '' }: { imageUrl?: string; alt: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <Box minHeight="26px" ref={(ref: any) => connect(drag(ref))}>
      {imageUrl && <ImageComponent width="100%" src={imageUrl} alt={alt} />}
    </Box>
  );
};

const ImageSettings = () => {
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

  const handleOnAdd = (imageFiles: UploadFile[]) => {
    setProp((props) => (props.imageUrl = imageFiles[0].base64));
    setImageFiles(imageFiles);
  };

  const handleOnRemove = () => {
    setImageFiles([]);
  };

  const handleChange = (value: string) => {
    setProp((props) => (props.alt = value));
  };

  return (
    <Box marginBottom="20px">
      <ImagesDropzone
        images={imageFiles}
        imagePreviewRatio={1}
        maxImagePreviewWidth="360px"
        objectFit="contain"
        acceptedFileTypes="image/jpg, image/jpeg, image/png"
        onAdd={handleOnAdd}
        onRemove={handleOnRemove}
      />
      <Input
        type="text"
        id="imageAltTextInput"
        onChange={handleChange}
        value={alt}
        label={
          <span>
            label <IconTooltip icon="info3" content="info" />
          </span>
        }
      />
    </Box>
  );
};

Image.craft = {
  props: {
    imageUrl: '',
  },
  related: {
    settings: ImageSettings,
  },
};

export default Image;
