import React from 'react';

import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { FormPDFExportFormValues } from 'containers/Admin/projects/components/PDFExportModal';

import FormBuilder from 'components/FormBuilder/edit';

import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { ideationConfig, proposalsConfig } from '../utils';

const configs = {
  ideation: ideationConfig,
  proposals: proposalsConfig,
};

const IdeaFormBuilder = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const participation_method =
    phase?.data.attributes.participation_method || 'ideation';
  const config = configs[participation_method] || ideationConfig;

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: config.isFormPhaseSpecific ? phaseId : undefined,
  });

  const locale = useLocale();

  const goBackUrl: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/form`;

  const handleExportPDF = async ({
    personal_data,
  }: FormPDFExportFormValues) => {
    await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
  };

  if (!project || !phase) return null;

  return (
    <FormBuilder
      builderConfig={{
        ...config,
        formCustomFields,
        goBackUrl,
        onDownloadPDF: handleExportPDF,
      }}
      viewFormLink={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`}
    />
  );
};

export default IdeaFormBuilder;
