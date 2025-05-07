import React from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { FormPDFExportFormValues } from 'containers/Admin/projects/components/PDFExportModal';

import FormBuilder from 'components/FormBuilder/edit';

import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { nativeSurveyConfig, clearOptionAndStatementIds } from '../utils';

const SurveyFormBuilder = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) => {
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
  const handleExportPDF = async ({
    personal_data,
  }: FormPDFExportFormValues) => {
    await saveSurveyAsPDF({ phaseId, locale, personal_data });
  };

  return (
    <FormBuilder
      builderConfig={{
        ...nativeSurveyConfig,
        formCustomFields: newCustomFields,
        goBackUrl: `/admin/projects/${projectId}/phases/${phaseId}/native-survey`,
        onDownloadPDF: handleExportPDF,
      }}
      viewFormLink={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
    />
  );
};

export default () => {
  const { projectId, phaseId } = useParams();

  if (typeof projectId !== 'string' || typeof phaseId !== 'string') {
    return null;
  }

  return <SurveyFormBuilder projectId={projectId} phaseId={phaseId} />;
};
