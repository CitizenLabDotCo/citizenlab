import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { FormPDFExportFormValues } from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import Button from 'components/UI/ButtonWithLink';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';
import { saveIdeaFormAsPDF } from './saveIdeaFormAsPDF';

export const InputForm = () => {
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const locale = useLocale();

  const handleExportPDF = async ({
    personal_data,
  }: FormPDFExportFormValues) => {
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
            linkTo={`/admin/projects/${projectId}/phases/${phaseId}/form/edit`}
            width="auto"
            icon="edit"
            data-cy="e2e-edit-input-form"
          >
            <FormattedMessage {...messages.editInputForm} />
          </Button>
          <DownloadPDFButtonWithModal
            mr="8px"
            onExport={handleExportPDF}
            formType="input_form"
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

export default InputForm;
