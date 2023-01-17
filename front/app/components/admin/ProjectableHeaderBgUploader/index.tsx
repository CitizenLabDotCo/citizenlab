import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';
import ImagesDropzone from 'components/UI/ImagesDropzone';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { HEADER_BG_ASPECT_RATIO } from 'services/projects';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

const HeaderBgInput = ({ imageUrl, onImageChange }: Props) => {
  const [headerBg, setHeaderBg] = useState<UploadFile | null>(null);
  useEffect(() => {
    (async () => {
      if (imageUrl) {
        const headerFile = await convertUrlToUploadFile(imageUrl, null, null);
        setHeaderBg(headerFile || null);
      }
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setHeaderBg(newHeaderFile);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setHeaderBg(null);
  };

  const imageShouldBeSaved = headerBg ? !headerBg.remote : false;

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.headerImageInputLabel} />
        <ImageInfoTooltip />
      </SubSectionTitle>

      {imageShouldBeSaved ? (
        <Box display="flex" flexDirection="column" gap="8px">
          <ImageCropperContainer
            image={headerBg}
            onComplete={onImageChange}
            aspect={HEADER_BG_ASPECT_RATIO}
            onRemove={handleImageRemove}
          />
        </Box>
      ) : (
        <ImagesDropzone
          images={headerBg ? [headerBg] : null}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          imagePreviewRatio={1 / HEADER_BG_ASPECT_RATIO}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />
      )}
    </SectionField>
  );
};

export default HeaderBgInput;
