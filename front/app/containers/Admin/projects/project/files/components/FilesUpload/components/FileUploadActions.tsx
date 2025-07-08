import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  hasStartedUploading: boolean;
  allDone: boolean;
  onUpload: () => void;
  onClose: () => void;
}

const FileUploadActions = ({
  hasStartedUploading,
  allDone,
  onUpload,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

  if (!allDone) {
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
      buttonStyle="secondary"
      text={formatMessage(messages.close)}
      mt="20px"
      onClick={onClose}
    />
  );
};

export default FileUploadActions;
