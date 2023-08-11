import React, { lazy } from 'react';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';
import { useParams } from 'react-router-dom';
import useLocale from 'hooks/useLocale';

// utils
import { ideationConfig } from '../utils';
import { saveIdeaFormAsPDF } from '../saveIdeaFormAsPDF';
import { isNilOrError } from 'utils/helperUtils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const IdeaFormBuilder = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const formCustomFields = useFormCustomFields({
    projectId,
  });
  const locale = useLocale();

  const goBackUrl = `/admin/projects/${projectId}/ideaform`;

  const onDownloadPDF = async () => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ projectId, locale });
  };

  return (
    <FormBuilder
      builderConfig={{
        ...ideationConfig,
        formCustomFields,
        goBackUrl,
        onDownloadPDF,
      }}
    />
  );
};

export default IdeaFormBuilder;
