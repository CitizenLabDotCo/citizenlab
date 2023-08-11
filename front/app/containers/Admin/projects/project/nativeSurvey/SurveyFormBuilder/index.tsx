import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';
import useFormCustomFields from 'hooks/useFormCustomFields';
import useLocale from 'hooks/useLocale';
import { nativeSurveyConfig } from '../utils';
import { saveSurveyAsPDF } from '../saveSurveyAsPDF';
import { isNilOrError } from 'utils/helperUtils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });
  const locale = useLocale();

  const goBackUrl = `/admin/projects/${projectId}/native-survey`;

  const onDownloadPDF = async () => {
    if (isNilOrError(locale)) return;
    await saveSurveyAsPDF({ projectId, locale });
  };

  return (
    <FormBuilder
      builderConfig={{
        ...nativeSurveyConfig,
        formCustomFields,
        goBackUrl,
        onDownloadPDF,
      }}
    />
  );
};

export default SurveyFormBuilder;
