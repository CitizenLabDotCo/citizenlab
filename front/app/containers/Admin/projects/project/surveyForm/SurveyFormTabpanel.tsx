import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { API_PATH } from 'containers/App/constants';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import Button from 'components/UI/ButtonWithLink';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';

const SurveyFormTabpanel = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) => {
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
    <>
      <Box gap="0px" flexWrap="wrap" width="100%" display="flex">
        <Box width="100%">
          <SectionTitle>
            <FormattedMessage {...messages.surveyForm} />
          </SectionTitle>
          <SectionDescription style={{ maxWidth: '700px' }}>
            <FormattedMessage {...messages.inputFormDescription} />
          </SectionDescription>
        </Box>
        <Box display="flex">
          <Button
            mr="8px"
            linkTo={`/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`}
            width="auto"
            icon="edit"
            data-cy="e2e-edit-survey-form"
          >
            <FormattedMessage {...messages.editSurveyForm} />
          </Button>
          <DownloadPDFButtonWithModal
            mr="8px"
            formType="survey"
            phaseId={phaseId}
          />
          <UpsellTooltip disabled={inputImporterAllowed}>
            <Button
              mr="8px"
              buttonStyle="secondary-outlined"
              icon="download"
              onClick={downloadExampleXlsxFile}
              disabled={!inputImporterAllowed}
            >
              <FormattedMessage {...messages.downloadExcelTemplate} />
            </Button>
          </UpsellTooltip>
        </Box>
      </Box>
    </>
  );
};

export default () => {
  const { projectId, phaseId } = useParams();

  if (!projectId || !phaseId) {
    return null;
  }

  return <SurveyFormTabpanel projectId={projectId} phaseId={phaseId} />;
};
