import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import FormBuilder from 'components/FormBuilder/edit';

import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { ideationConfig, proposalsConfig } from '../utils';

const configs = {
  ideation: ideationConfig,
  proposals: proposalsConfig,
};

const IdeaFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
  };

  if (!project || !phase) return null;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...config,
          formCustomFields,
          goBackUrl,
          onDownloadPDF: handleDownloadPDF,
        }}
        viewFormLink={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`}
      />
      <PDFExportModal
        open={exportModalOpen}
        formType="idea_form"
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportPDF}
      />
    </>
  );
};

export default IdeaFormBuilder;
