import React, { useState, lazy } from 'react';

import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import { isNilOrError } from 'utils/helperUtils';

import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { ideationConfig } from '../utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const IdeaFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
  });
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);

  const locale = useLocale();

  const goBackUrl: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/ideaform`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
  };

  if (!project || !phase) return null;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...ideationConfig,
          formCustomFields,
          goBackUrl,
          onDownloadPDF: handleDownloadPDF,
        }}
        viewFormLink={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phase.data.id}`}
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
