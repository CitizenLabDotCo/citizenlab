import React, { useState, lazy } from 'react';

// hooks
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import { useParams } from 'react-router-dom';
import useLocale from 'hooks/useLocale';

// components
import PDFExportModal from 'containers/Admin/projects/components/PDFExportModal';

// utils
import { ideationConfig } from '../utils';
import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { isNilOrError } from 'utils/helperUtils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const IdeaFormBuilder = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { projectId } = useParams() as {
    projectId: string;
  };

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
  });
  const locale = useLocale();

  const goBackUrl = `/admin/projects/${projectId}/ideaform`;

  const handleDownloadPDF = () => setExportModalOpen(true);

  const handleExportPDF = async ({
    name,
    email,
    phase_id,
  }: {
    name: boolean;
    email: boolean;
    phase_id?: string;
  }) => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ projectId, locale, name, email, phase_id });
  };

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...ideationConfig,
          formCustomFields,
          goBackUrl,
          onDownloadPDF: handleDownloadPDF,
        }}
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
