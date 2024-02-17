import React, { useState, lazy } from 'react';

// components
import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

// router
import {useParams, useSearchParams} from 'react-router-dom';

// hooks
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useLocale from 'hooks/useLocale';

// utils
import { nativeSurveyConfig } from '../utils';
import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import {uuid4} from "@sentry/utils";
import {generateTempId} from "../../../../../../components/FormBuilder/utils";

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy_from');

  const locale = useLocale();
  const { data: customFields } = useFormCustomFields({
    projectId,
    phaseId: copyFrom ? copyFrom : phaseId,
  });

  const goBackUrl = `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;
  const downloadPdfLink = phaseId
    ? `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`
    : `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  // If a copied form, reset IDs for fields and add temp-ids to options
  const resetCustomFormIds = (customFields: any) => {
    return customFields?.map((field: any) => {
      field['id'] = uuid4();
      if (field.options?.length > 0) {
        field.options = field.options.map((option: any) => {
          const { id, ...rest } = option;
          rest['temp-id'] = generateTempId();
          return rest;
        });
      }
      return field;
    });
  }

  const formCustomFields = copyFrom ? resetCustomFormIds(customFields) : customFields;

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
