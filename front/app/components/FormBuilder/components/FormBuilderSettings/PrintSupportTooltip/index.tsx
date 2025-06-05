import { IconTooltip } from '@citizenlab/cl2-component-library';
import React from 'react';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

type Props = { fieldType: string };
const PageButtonSettings = ({ fieldType }: Props) => {
  const { formatMessage } = useIntl();

  const fileUploadTypes = [
    'files',
    'image_files',
    'file_upload',
    'shapefile_upload',
  ];
  const mappingTypes = ['point', 'line', 'polygon'];

  let messageKey = fieldType;
  if (fileUploadTypes.includes(fieldType)) messageKey = 'fileupload';
  if (mappingTypes.includes(fieldType)) messageKey = 'mapping';

  const messageDescriptor = messages[messageKey];
  if (!messageDescriptor) return null;

  return (
    <IconTooltip
      content={formatMessage(messageDescriptor)}
      icon="info-solid"
      theme="light"
    />
  );
};

export default PageButtonSettings;
