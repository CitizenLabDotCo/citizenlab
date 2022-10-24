import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  RankedTester,
  rankWith,
  scopeEndsWith,
  ControlProps,
} from '@jsonforms/core';
import React, { useContext, useEffect, useState } from 'react';
import { FormLabel } from 'components/UI/FormComponents';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import ErrorDisplay from '../ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { FormContext } from '../../contexts';
import { Box } from '@citizenlab/cl2-component-library';

const ImageControl = ({
  uischema,
  path,
  data,
  handleChange,
  errors,
  schema,
  id,
  required,
}: ControlProps) => {
  const handleUploadOnAdd = (imageFiles: UploadFile[]) => {
    handleChange(path, [{ image: imageFiles[0].base64 }]);
    setImageFiles(imageFiles);
    setDidBlur(true);
  };
  const handleUploadOnRemove = (_file) => {
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

  return (
    <Box id="e2e-idea-image-upload">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
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
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </Box>
  );
};

export default withJsonFormsControlProps(ImageControl);

export const imageControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('images_attributes')
);
