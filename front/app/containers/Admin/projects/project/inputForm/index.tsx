import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';
import { saveIdeaFormAsPDF } from './saveIdeaFormAsPDF';

export const IdeaForm = () => {
  const inputImporterEnabled = useFeatureFlag({
    name: 'input_importer',
  });

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const locale = useLocale();

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
  };

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
            <FormattedMessage {...messages.inputForm} />
          </SectionTitle>
          <SectionDescription style={{ maxWidth: '700px' }}>
            <FormattedMessage {...messages.inputFormDescription} />
          </SectionDescription>
        </Box>
        <Box display="flex" flexDirection="row">
          <Button
            mr="8px"
            linkTo={`/admin/projects/${projectId}/phases/${phaseId}/ideaform/edit`}
            width="auto"
            icon="edit"
            data-cy="e2e-edit-input-form"
          >
            <FormattedMessage {...messages.editInputForm} />
          </Button>
          <Box mr="8px">
            <Button
              onClick={handleDownloadPDF}
              width="auto"
              icon="download"
              data-cy="e2e-save-input-form-pdf"
            >
              <FormattedMessage {...messages.downloadInputForm} />
            </Button>
          </Box>
          {inputImporterEnabled && (
            <Button
              mr="8px"
              buttonStyle="secondary"
              icon="download"
              onClick={downloadExampleXlsxFile}
            >
              <FormattedMessage {...messages.downloadExcelTemplate} />
            </Button>
          )}
        </Box>
      </Box>
      <PDFExportModal
        open={exportModalOpen}
        formType="idea_form"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
    </>
  );
};

export default IdeaForm;
