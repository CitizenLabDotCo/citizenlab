import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const getMessageKey = (fieldType: string): string => {
  const fileUploadTypes = [
    'files',
    'image_files',
    'file_upload',
    'shapefile_upload',
  ];
  const mappingTypes = ['point', 'line', 'polygon'];

  switch (true) {
    case fileUploadTypes.includes(fieldType):
      return 'fileupload';
    case mappingTypes.includes(fieldType):
      return 'mapping';
    default:
      return fieldType;
  }
};

type Props = { fieldType: string };

const PageButtonSettings = ({ fieldType }: Props) => {
  const { formatMessage } = useIntl();

  const messageKey = getMessageKey(fieldType);
  const messageDescriptor = messages[messageKey];

  if (!messageDescriptor) return null;

  return (
    <IconTooltip
      content={formatMessage(messageDescriptor)}
      icon="info-solid"
      theme="light"
      placement="bottom"
    />
  );
};

export default PageButtonSettings;
