import React, { useEffect, useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import ImageCropper from 'components/admin/ImageCropper';
import Warning from 'components/UI/Warning';
import cropperMessages from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/messages';

import { UploadFile } from 'typings';
import HeaderBgDropzone from './HeaderBgDropzone';
import { FormattedMessage } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

export default ({ imageUrl, onImageChange }: Props) => {
  const [headerBg, setHeaderBg] = useState<UploadFile[] | null>(null);
  useEffect(() => {
    (async () => {
      if (imageUrl) {
        const headerFile = await convertUrlToUploadFile(imageUrl, null, null);
        setHeaderBg(headerFile ? [headerFile] : null);
      }
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setHeaderBg([newHeaderFile]);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setHeaderBg(null);
  };

  const imageIsNotSaved = headerBg && !headerBg[0].remote;

  return imageIsNotSaved ? (
    <Box display="flex" flexDirection="column" gap="8px">
      <ImageCropper image={headerBg} onComplete={onImageChange} />
      <Warning>
        <Text>
          <FormattedMessage
            {...cropperMessages.fixedRatioImageCropperInfo}
            values={{
              link: (
                <a
                  // TODO: fix
                  href={'sdf'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage
                    {...cropperMessages.fixedRatioImageCropperInfoLink}
                  />
                </a>
              ),
            }}
          />
        </Text>
      </Warning>
    </Box>
  ) : (
    <HeaderBgDropzone
      image={headerBg}
      onImageAdd={handleImageAdd}
      onImageRemove={handleImageRemove}
    />
  );
};
