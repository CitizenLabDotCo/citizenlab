import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import React, { useContext, useEffect, useState } from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';
import useIdeaImages from 'hooks/useIdeaImages';
import { InputIdContext } from '.';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { deleteIdeaImage } from 'services/ideaImages';
import { isNilOrError } from 'utils/helperUtils';

interface ImageControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
  schema: any;
  uischema: any;
}

const ImageControl = (props: ImageControlProps) => {
  const { uischema, path, handleChange, errors } = props;

  const handleUploadOnAdd = (imageFiles: UploadFile[]) => {
    handleChange(path, [{ image: imageFiles[0].base64 }]);
    setImageFiles(imageFiles);
  };

  const handleUploadOnRemove = (file) => {
    if (inputId && file.remote) {
      deleteIdeaImage(inputId, file.id);
    }
    handleChange(path, []);
    setImageFiles([]);
  };

  const inputId = useContext(InputIdContext);
  const remoteImages = useIdeaImages(inputId);

  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (
      inputId &&
      !isNilOrError(remoteImages) &&
      remoteImages.length > 0 &&
      remoteImages[0].attributes.versions.medium
    ) {
      (async () => {
        const newRemoteFile = await convertUrlToUploadFile(
          remoteImages[0].attributes.versions.medium as string,
          remoteImages[0].id
        );
        newRemoteFile && setImageFiles([newRemoteFile]);
      })();
    }
  }, [remoteImages, inputId]);

  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <ImagesDropzone
        id="idea-image-dropzone"
        images={imageFiles}
        imagePreviewRatio={135 / 298}
        acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
        onAdd={handleUploadOnAdd}
        onRemove={handleUploadOnRemove}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </Box>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('images_attributes')
);
