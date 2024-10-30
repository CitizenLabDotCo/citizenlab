import React, { useState } from 'react';

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
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import buttonMessages from 'containers/Admin/projects/project/inputForm/messages';
import { API_PATH } from 'containers/App/constants';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';

import { saveIdeaFormAsPDF } from '../../inputForm/saveIdeaFormAsPDF';
import { saveSurveyAsPDF } from '../../nativeSurvey/saveSurveyAsPDF';
import { getFormActionsConfig } from '../../nativeSurvey/utils';
import sharedMessages from '../messages';

import messages from './messages';

const EmptyState = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const locale = useLocale();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  if (!project || !phase) {
    return null;
  }

  const { downloadPdfLink: surveyDownloadPdfLink } = getFormActionsConfig(
    project.data,
    () => {},
    phase.data
  );

  const downloadExampleXlsxFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/phases/${phaseId}/importer/export_form/idea/xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    if (isNilOrError(locale)) return;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (phase?.data.attributes.participation_method === 'native_survey') {
      await saveSurveyAsPDF({
        downloadPdfLink: surveyDownloadPdfLink,
        locale,
        personal_data,
      });
    } else {
      await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
    }
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
            {...(importPrintedFormsEnabled
              ? messages.noIdeasYet
              : messages.noIdeasYetPrintedFormsDisabled)}
            values={{
              importFile: <FormattedMessage {...sharedMessages.importFile} />,
            }}
          />
        </Text>
        <Box display="flex" flexDirection="row">
          <Box mr="8px">
            <Button
              bgColor={colors.primary}
              onClick={handleDownloadPDF}
              width="auto"
              icon="download"
              data-cy="e2e-save-input-form-pdf"
            >
              {/* TODO: distinguish copies between surveys and inputs */}
              <FormattedMessage {...buttonMessages.downloadInputForm} />
            </Button>
          </Box>
          <Button
            mr="8px"
            buttonStyle="secondary-outlined"
            icon="download"
            onClick={downloadExampleXlsxFile}
          >
            <FormattedMessage {...buttonMessages.downloadExcelTemplate} />
          </Button>
        </Box>
      </Box>
      <PDFExportModal
        open={exportModalOpen}
        formType={
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          phase?.data.attributes.participation_method === 'native_survey'
            ? 'survey'
            : 'idea_form'
        }
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
    </Box>
  );
};

export default EmptyState;
