import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  stylingConsts,
  Button,
} from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import buttonMessages from 'containers/Admin/projects/project/inputForm/messages';
import { API_PATH } from 'containers/App/constants';

import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import sharedMessages from '../messages';

import messages from './messages';
import { isPDFUploadSupported, supportsNativeSurvey } from './utils';

const EmptyState = () => {
  const { phaseId } = useParams() as {
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);

  const participationMethod = phase?.data.attributes.participation_method;

  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  const pdfImportSupported = isPDFUploadSupported(participationMethod);

  const downloadExampleXlsxFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/phases/${phaseId}/importer/export_form/idea/xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="50px"
    >
      <Box
        w="100%"
        maxWidth="700px"
        bgColor={colors.white}
        borderRadius={stylingConsts.borderRadius}
        boxShadow={`0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`}
        px="20px"
        pb="16px"
      >
        <Title variant="h1" color="primary">
          <FormattedMessage {...sharedMessages.inputImporter} />
        </Title>
        <Text>
          <FormattedMessage
            {...(pdfImportSupported
              ? messages.noIdeasYet
              : messages.noIdeasYetNoPdf)}
            values={{
              importFile: <FormattedMessage {...sharedMessages.importFile} />,
            }}
          />
        </Text>
        <Box display="flex">
          {pdfImportSupported && (
            <DownloadPDFButtonWithModal
              formType={
                supportsNativeSurvey(participationMethod)
                  ? 'survey'
                  : 'input_form'
              }
              mr="8px"
              phaseId={phaseId}
            />
          )}
          <UpsellTooltip disabled={inputImporterAllowed}>
            <Button
              buttonStyle="secondary-outlined"
              icon="download"
              onClick={downloadExampleXlsxFile}
              disabled={!inputImporterAllowed}
            >
              <FormattedMessage {...buttonMessages.downloadExcelTemplate} />
            </Button>
          </UpsellTooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
