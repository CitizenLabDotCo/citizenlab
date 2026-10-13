import React, { useState, useEffect } from 'react';

import { Box, Label, IconTooltip } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc, UploadFile } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';

import { IMAGE_UPLOADING_EVENT } from 'components/admin/ContentBuilder/constants';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import messages from './messages';

import { Props } from '.';

const ImageSettings = injectIntl(({ intl: { formatMessage } }) => {
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const {
    actions: { setProp },
    image,
    alt,
  } = useNode((node) => ({
    image: node.data.props.image,
    alt: node.data.props.alt,
  }));

  useEffect(() => {
    if (image?.imageUrl) {
      (async () => {
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);
        const imageFile = await convertUrlToUploadFile(image?.imageUrl);
        if (imageFile) {
          setImageFiles([imageFile]);
        }
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
      })();
    }
  }, [image?.imageUrl]);

  const handleOnAdd = async (imageFiles: UploadFile[]) => {
    setImageFiles(imageFiles);

    try {
      const response = await addContentBuilderImage(imageFiles[0].base64);
      setProp((props: Props) => {
        props.image = {
          dataCode: response.data.attributes.code,
          imageUrl: response.data.attributes.image_url,
        };
      });
    } catch {
      // Do nothing
    }
  };

  const handleOnRemove = () => {
    setProp((props: Props) => {
      props.image = {
        dataCode: undefined,
        imageUrl: undefined,
      };
      props.alt = {};
    });
    setImageFiles([]);
  };

  const handleChange = (value: Multiloc) => {
    setProp((props: Props) => (props.alt = value));
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
        <Label htmlFor="imageAltTextInput">
          {formatMessage(messages.imageMultilocAltTextLabel)}
          <IconTooltip
            content={formatMessage(messages.imageMultilocAltTextTooltip)}
          />
        </Label>
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="imageAltTextInput"
          onChange={handleChange}
          valueMultiloc={alt}
        />
      </Box>
    </Box>
  );
});

export default ImageSettings;
