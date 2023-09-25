import React, { useState, lazy } from 'react';

// components
import PDFExportModal from 'containers/Admin/projects/components/PDFExportModal';

// router
import { useParams } from 'react-router-dom';

// hooks
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useLocale from 'hooks/useLocale';

// utils
import { nativeSurveyConfig } from '../utils';
import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';

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

  const goBackUrl = `/admin/projects/${projectId}/native-survey`;
  const downloadPdfLink = phaseId
    ? `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`
    : `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({
    name,
    email,
  }: {
    name: boolean;
    email: boolean;
  }) => {
    if (isNilOrError(locale)) return;
    await saveSurveyAsPDF({ downloadPdfLink, locale, name, email });
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
