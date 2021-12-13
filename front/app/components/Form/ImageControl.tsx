import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import React from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';

import { UploadFile } from 'typings';

interface ImageControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
  schema: any;
  uischema: any;
}

const ImageControl = (props: ImageControlProps) => {
  const { uischema, data, path, handleChange, errors } = props;

  const handleUploadOnAdd = (imageFile: UploadFile[]) => {
    handleChange(path, imageFile[0]);
  };

  const handleUploadOnRemove = () => {
    handleChange(path, null);
  };

  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <ImagesDropzone
        id="idea-image-dropzone"
        images={data ? [data] : []}
        imagePreviewRatio={135 / 298}
        acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
        onAdd={handleUploadOnAdd}
        onRemove={handleUploadOnRemove}
      />
      {errors && <Error text={errors} />}
    </Box>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('image')
);
