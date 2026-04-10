import React from 'react';

import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { API_PATH } from 'containers/App/constants';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';

interface Props {
  phaseId: string;
}

const ExcelDownloadButton = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  const downloadExampleXlsxFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/phases/${phaseId}/importer/export_form/idea/xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <Box display="flex" alignItems="center">
      <UpsellTooltip disabled={inputImporterAllowed} theme="dark">
        <Button
          buttonStyle="text"
          icon="download"
          onClick={downloadExampleXlsxFile}
          disabled={!inputImporterAllowed}
          px="4px"
        >
          <FormattedMessage {...messages.template} />
        </Button>
      </UpsellTooltip>
      {inputImporterAllowed && (
        <IconTooltip
          content={formatMessage(messages.downloadExcelTemplateTooltip)}
        />
      )}
    </Box>
  );
};

export default ExcelDownloadButton;
