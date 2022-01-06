import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import React, { useState } from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';
import { getLabel } from 'utils/JSONFormUtils';

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

  const handleUploadOnRemove = () => {
    handleChange(path, []);
    setImageFiles([]);
  };

  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);

  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{getLabel(uischema, uischema, path)}</FormLabelStyled>
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
