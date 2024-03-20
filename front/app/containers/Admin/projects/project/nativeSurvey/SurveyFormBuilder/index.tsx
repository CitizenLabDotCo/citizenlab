import React, { useState, lazy } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { isNilOrError } from 'utils/helperUtils';

import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { nativeSurveyConfig, resetOptionsIfNotPersisted } from '../utils';

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
  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: copyFrom ? copyFrom : phaseId,
    copy: copyFrom ? true : false,
  });

  // // Duplicate the map configs if this survey is being copied from another phase
  // const mapConfigIds = customFields
  //   ?.map((field) => field.map_config?.data?.id)
  //   .filter((x) => x); // remove nulls
  // const customFieldsNewMapConfigs = useDuplicateMapConfigs(
  //   copyFrom && mapConfigIds ? mapConfigIds : []
  // );

  if (!phase || !formCustomFields) return null;

  // // Create lookup of existing map config IDs to new IDs
  // const newMapConfigIds = {};
  // mapConfigIds?.forEach((oldId: string, index) => {
  //   newMapConfigIds[oldId] = customFieldsNewMapConfigs.at(index)?.data?.data.id;
  // });
  //
  // // Copy fields from another survey if provided or reset options if form not yet persisted
  // const surveyFormPersisted =
  //   phase.data.attributes.custom_form_persisted || false;
  // const formCustomFields = copyFrom
  //   ? resetCopiedForm(customFields, newMapConfigIds)
  //   : resetOptionsIfNotPersisted(customFields, surveyFormPersisted);

  const newCustomFields = resetOptionsIfNotPersisted(formCustomFields, true);
  console.log('formCustomFields', newCustomFields);

  // PDF downloading
  const downloadPdfLink = `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`;
  const handleDownloadPDF = () => setExportModalOpen(true);
  const handleExportPDF = async ({ personal_data }: FormValues) => {
    if (isNilOrError(locale)) return;
    await saveSurveyAsPDF({ downloadPdfLink, locale, personal_data });
  };

  const goBackUrl = `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...nativeSurveyConfig,
          formCustomFields: newCustomFields,
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
