import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PDFExportModal, {
  FormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import FormBuilder from 'components/FormBuilder/edit';

import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { ideationConfig } from '../utils';

const IdeaFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
  });
  const { data: project } = useProjectById(projectId);

  const locale = useLocale();

  const goBackUrl: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/form`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({ personal_data }: FormValues) => {
    await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
  };

  if (!project) return null;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...ideationConfig,
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
