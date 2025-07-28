import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  hasStartedUploading: boolean;
  finishedUploading: boolean;
  onUpload: () => void;
  onClose: () => void;
};

const FileUploadActions = ({
  hasStartedUploading,
  finishedUploading,
  onUpload,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

  if (!finishedUploading) {
    return (
      <Button
        buttonStyle="admin-dark"
        text={formatMessage(messages.upload)}
        mt="20px"
        onClick={onUpload}
        disabled={hasStartedUploading}
      />
    );
  }

  return (
    <Button
      buttonStyle="admin-dark"
      text={formatMessage(messages.done)}
      mt="20px"
      onClick={onClose}
    />
  );
};

export default FileUploadActions;
