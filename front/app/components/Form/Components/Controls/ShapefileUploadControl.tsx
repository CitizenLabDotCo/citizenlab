import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import SingleFileUploader, {
  AttachmentFile,
} from 'components/Form/Components/SingleFileUploader';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const ShapefileUploadControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  required,
  id,
  schema,
  visible,
}: ControlProps) => {
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);

  const handleFileOnAdd = async (fileToAdd: AttachmentFile) => {
    handleChange(path, {
      name: fileToAdd.name,
      content: fileToAdd.content,
    });
    setDidBlur(true);
  };
  const handleFileOnRemove = () => {
    handleChange(path, undefined);
    setDidBlur(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <Box>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Text m="0px" mb="4px" fontSize="s" color="coolGrey600">
        {formatMessage(messages.uploadShapefileInstructions)}
      </Text>
      <SingleFileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        file={data}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(ShapefileUploadControl);

export const shapefileUploadControlTester = (uischema) => {
  if (uischema?.options?.input_type === 'shapefile_upload') {
    return 1000;
  }
  return -1;
};
