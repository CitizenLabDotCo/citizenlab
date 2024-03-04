import React, { useState, lazy } from 'react';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';
import { useParams } from 'react-router-dom';

import { isNilOrError } from 'utils/helperUtils';

import useFormCustomFields from 'api/custom_fields/useCustomFields';

import useLocale from 'hooks/useLocale';

import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { nativeSurveyConfig } from '../utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const locale = useLocale();
  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId,
  });

  const goBackUrl = `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;
  const downloadPdfLink = phaseId
    ? `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`
    : `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    if (isNilOrError(locale)) return;
    await saveSurveyAsPDF({ downloadPdfLink, locale, personal_data });
  };

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...nativeSurveyConfig,
          formCustomFields,
          goBackUrl,
          onDownloadPDF: handleDownloadPDF,
        }}
      />
      <PDFExportModal
        open={exportModalOpen}
        formType="survey"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
    </>
  );
};

export default SurveyFormBuilder;
