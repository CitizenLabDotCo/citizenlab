import { useState, useEffect } from 'react';
import {
  surveyCustomFieldsStream,
  ISurveyCustomFieldData,
  ISurveyCustomFieldInputType,
} from '../services/surveyCustomFields';

interface Props {
  inputTypes?: ISurveyCustomFieldInputType[];
}

export default function useSurveyCustomFields({ inputTypes }: Props) {
  const [surveyCustomFields, setSurveyCustomFields] = useState<
    ISurveyCustomFieldData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = surveyCustomFieldsStream({
      queryParameters: { input_types: inputTypes },
    }).observable.subscribe((surveyCustomFields) => {
      setSurveyCustomFields(surveyCustomFields.data);
    });

    return () => subscription.unsubscribe();
  }, [inputTypes]);

  return surveyCustomFields;
}
