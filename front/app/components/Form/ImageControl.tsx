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
import ErrorDisplay from './ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { deleteIdeaImage } from 'services/ideaImages';
import useIdeaImages from 'hooks/useIdeaImages';
import { isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { FormContext } from './contexts';

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
  const handleUploadOnRemove = (file) => {
    if (inputId && file.remote) {
      deleteIdeaImage(inputId, file.id);
    }
    handleChange(path, []);
    setImageFiles([]);
  };

  const { inputId } = useContext(FormContext);
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
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <ImagesDropzone
        id={sanitizeForClassname(id)}
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
