import React, { useContext, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  RankedTester,
  rankWith,
  scopeEndsWith,
  ControlProps,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { UploadFile } from 'typings';

import { FormLabel } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import { FormContext } from '../../contexts';
import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const ImageControl = ({
  uischema,
  path,
  data,
  handleChange,
  errors,
  schema,
  id,
  required,
  visible,
}: ControlProps) => {
  const handleUploadOnAdd = (imageFiles: UploadFile[]) => {
    handleChange(path, [{ image: imageFiles[0].base64 }]);
    setImageFiles(imageFiles);
    setDidBlur(true);
  };
  const handleUploadOnRemove = () => {
    handleChange(path, undefined);
    setImageFiles([]);
    setDidBlur(true);
  };

  const { inputId } = useContext(FormContext);

  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [didBlur, setDidBlur] = useState(false);

  useEffect(() => {
    if (
      inputId &&
      !isNilOrError(data) &&
      data.length > 0 &&
      data[0].attributes?.versions.medium
    ) {
      (async () => {
        const newRemoteFile = await convertUrlToUploadFile(
          data[0].attributes.versions.medium as string,
          data[0].id
        );
        newRemoteFile && setImageFiles([newRemoteFile]);
      })();
    }
  }, [data, inputId]);

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-image-upload">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <ImagesDropzone
        id={sanitizeForClassname(id)}
        images={imageFiles}
        imagePreviewRatio={135 / 298}
        acceptedFileTypes={{
          'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
        }}
        onAdd={handleUploadOnAdd}
        onRemove={handleUploadOnRemove}
      />
      <ErrorDisplay
        inputId={id}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('images_attributes')
);
