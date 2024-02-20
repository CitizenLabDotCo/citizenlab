import React, { useState, lazy } from 'react';

// components
import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

// router
import { useParams, useSearchParams } from 'react-router-dom';

// hooks
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useLocale from 'hooks/useLocale';

// utils
import { nativeSurveyConfig } from '../utils';
import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import { uuid4 } from '@sentry/utils';
import { generateTempId } from 'components/FormBuilder/utils';

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
    // Set the field IDs
    // TODO: Remove key?
    let tempIdMap = { survey_end: 'survey_end' };
    const newFields = customFields?.map((field: any) => {
      const { id, ...newField } = field;
      if (newField.input_type === 'page') {
        newField.temp_id = generateTempId();
        tempIdMap[id] = newField.temp_id;
      } else {
        newField.id = uuid4();
      }

      if (newField.options?.length > 0) {
        newField.options = newField.options.map((option: any) => {
          const { id, ...newOption } = option;
          newOption.temp_id = generateTempId();
          tempIdMap[id] = newOption.temp_id;
          return newOption;
        });
      }
      return newField;
    });

    // Update the logic
    return newFields?.map((field: any) => {
      const { ...newField } = field;
      if (newField.logic?.rules) {
        const newRules = newField.logic.rules.map((rule: any) => {
          return {
            if: tempIdMap[rule.if],
            goto_page_id: tempIdMap[rule.goto_page_id],
          };
        });
        newField.logic = { rules: newRules };
      } else if (newField.logic) {
        newField.logic = {
          next_page_id: tempIdMap[newField.logic.next_page_id],
        };
      }
      return newField;
    });
  };

  const formCustomFields = copyFrom
    ? resetCustomFormIds(customFields)
    : customFields;

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
