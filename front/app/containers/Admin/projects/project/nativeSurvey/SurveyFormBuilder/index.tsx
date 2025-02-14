import React, { useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import FormBuilder from 'components/FormBuilder/edit';

import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import {
  nativeSurveyConfig,
  clearOptionAndStatementIds,
  communityMonitorConfig,
} from '../utils';

const SurveyFormBuilder = () => {
  const { data: appConfig } = useAppConfiguration();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy_from');
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);

  const locale = useLocale();
  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: copyFrom ? copyFrom : phaseId,
    copy: copyFrom ? true : false,
  });

  if (!phase || !project || !formCustomFields) return null;

  // Reset option and statement IDs if this is a new or copied form
  const isFormPersisted = copyFrom
    ? false
    : phase.data.attributes.custom_form_persisted;
  const newCustomFields = isFormPersisted
    ? formCustomFields
    : clearOptionAndStatementIds(formCustomFields);

  // PDF downloading
  const downloadPdfLink = `${API_PATH}/phases/${phaseId}/importer/export_form/idea/pdf`;
  const handleDownloadPDF = () => setExportModalOpen(true);
  const handleExportPDF = async ({ personal_data }: FormValues) => {
    await saveSurveyAsPDF({ downloadPdfLink, locale, personal_data });
  };

  // If this is the Community Monitor survey, use the correct configuration
  const isCommunityMonitorSurvey =
    appConfig?.data.attributes.settings.community_monitor?.project_id ===
    projectId;

  const config = isCommunityMonitorSurvey
    ? communityMonitorConfig
    : nativeSurveyConfig;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...config,
          formCustomFields: newCustomFields,
          goBackUrl: `/admin/projects/${projectId}/phases/${phaseId}/native-survey`,
          onDownloadPDF: handleDownloadPDF,
        }}
        viewFormLink={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
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
