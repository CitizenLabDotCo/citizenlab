import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Box } from '@citizenlab/cl2-component-library';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { UploadFile } from 'typings';
import { HEADER_BG_ASPECT_RATIO, IProjectFormState } from 'services/projects';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

const HeaderBgInput = ({ imageUrl, onImageChange }: Props) => {
  const [projectHeaderImage, setProjectHeaderImage] =
    useState<IProjectFormState['projectHeaderImage']>(null);

  useEffect(() => {
    (async () => {
      const projectHeaderImage = imageUrl
        ? await convertUrlToUploadFile(imageUrl, null, null)
        : null;
      setProjectHeaderImage(projectHeaderImage ? [projectHeaderImage] : null);
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setProjectHeaderImage([newHeaderFile]);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setProjectHeaderImage(null);
  };

  const imageIsNotSaved = projectHeaderImage && !projectHeaderImage[0].remote;

  return (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.headerImageLabelText} />
        <ImageInfoTooltip />
      </SubSectionTitle>

      {imageIsNotSaved ? (
        <Box display="flex" flexDirection="column" gap="8px">
          <ImageCropperContainer
            image={projectHeaderImage}
            onComplete={onImageChange} // projectHeaderImage is not updated, but we don't need it
            aspect={HEADER_BG_ASPECT_RATIO}
            onRemove={handleImageRemove}
          />
        </Box>
      ) : (
        <StyledImagesDropzone
          images={projectHeaderImage}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          imagePreviewRatio={1 / HEADER_BG_ASPECT_RATIO}
          maxImagePreviewWidth="500px"
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />
      )}
    </StyledSectionField>
  );
};

export default HeaderBgInput;
