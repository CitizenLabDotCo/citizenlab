import React, { useState, lazy } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { isNilOrError } from 'utils/helperUtils';

import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import {
  nativeSurveyConfig,
  resetCopiedForm,
  resetOptionsIfNotPersisted,
} from '../utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy_from');
  const { data: phase } = usePhase(phaseId);

  const locale = useLocale();
  const { data: customFields } = useFormCustomFields({
    projectId,
    phaseId: copyFrom ? copyFrom : phaseId,
  });

  const goBackUrl: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;
  const downloadPdfLink = `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  if (!phase || !customFields) return null;

  const surveyFormPersisted =
    phase.data.attributes.custom_form_persisted || false;

  const formCustomFields = copyFrom
    ? resetCopiedForm(customFields)
    : resetOptionsIfNotPersisted(customFields, surveyFormPersisted);

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
