import React from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage } from 'utils/cl-intl';

import formSyncMessages from 'components/admin/FormSync/messages';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const ImportButtons = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const printedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  return (
    <Box display="flex" gap="8px">
      <Button
        buttonStyle="text"
        icon="upload-file"
        onClick={onClickExcelImport}
      >
        <FormattedMessage {...formSyncMessages.importFile} />
      </Button>
      {printedFormsEnabled ? (
        <Button
          buttonStyle="admin-dark"
          icon="form-sync"
          onClick={onClickPDFImport}
        >
          <FormattedMessage {...formSyncMessages.importScans} />
        </Button>
      ) : (
        <Tooltip
          content={
            <Box display="flex" flexDirection="column" gap="8px">
              <FormattedMessage {...formSyncMessages.unlockScanningTooltip1} />
              <FormattedMessage {...formSyncMessages.unlockScanningTooltip2} />
            </Box>
          }
          theme="dark"
        >
          <Button buttonStyle="admin-dark" icon="lock">
            <FormattedMessage {...formSyncMessages.unlockScanning} />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default ImportButtons;
