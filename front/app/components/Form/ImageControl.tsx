import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  RankedTester,
  rankWith,
  scopeEndsWith,
  ControlProps,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { FormLabel } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';
import { getLabel } from 'utils/JSONFormUtils';

const ImageControl = ({
  uischema,
  path,
  handleChange,
  errors,
  schema,
  id,
  required,
}: ControlProps) => {
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
    <>
      <FormLabel
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <ImagesDropzone
        id={id}
        images={imageFiles}
        imagePreviewRatio={135 / 298}
        acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
        onAdd={handleUploadOnAdd}
        onRemove={handleUploadOnRemove}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('images_attributes')
);
