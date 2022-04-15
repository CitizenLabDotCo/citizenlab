import React, { useState, useEffect } from 'react';

// components
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// craft
import { useNode } from '@craftjs/core';
import {
  Box,
  Image as ImageComponent,
} from '@citizenlab/cl2-component-library';

const Image = ({ imageUrl }: { imageUrl?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <Box minHeight="26px" ref={(ref: any) => connect(drag(ref))}>
      {imageUrl && <ImageComponent width="100%" src={imageUrl} alt="" />}
    </Box>
  );
};

const ImageSettings = () => {
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const {
    actions: { setProp },
    imageUrl,
  } = useNode((node) => ({
    imageUrl: node.data.props.imageUrl,
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
