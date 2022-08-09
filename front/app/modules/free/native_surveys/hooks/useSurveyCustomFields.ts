import { useState, useEffect } from 'react';

import {
  surveyCustomFieldsStream,
  ISurveyCustomFieldData,
  ISurveyCustomFieldInputType,
} from '../services/surveyCustomFields';

interface Props {
  inputTypes?: ISurveyCustomFieldInputType[];
  projectId: string;
}

export default function useSurveyCustomFields({
  inputTypes,
  projectId,
}: Props) {
  const [surveyCustomFields, setSurveyCustomFields] = useState<
    ISurveyCustomFieldData[] | undefined | Error
  >(undefined);

  useEffect(() => {
    const subscription = surveyCustomFieldsStream(projectId, {
      queryParameters: { input_types: inputTypes },
    }).observable.subscribe((surveyCustomFields) => {
      setSurveyCustomFields(surveyCustomFields.data);
    });

    return () => subscription.unsubscribe();
  }, [inputTypes, projectId]);

  return {
    surveyCustomFields,
    setSurveyCustomFields,
  };
}
