import { useState, useEffect } from 'react';

import {
  ICustomFieldInputType,
  ICustomFieldResponse,
  IFlatCustomField,
  surveyCustomFieldsStream,
} from '../services/surveyCustomFields';

interface Props {
  inputTypes?: ICustomFieldInputType[];
  projectId: string;
}

export default function useSurveyCustomFields({
  inputTypes,
  projectId,
}: Props) {
  const [surveyCustomFields, setSurveyCustomFields] = useState<
    IFlatCustomField[] | undefined | Error
  >(undefined);

  useEffect(() => {
    // We flatten this to work with the differences in the body of the update structure and that of the get response
    const flattenSurveyCustomFields = (
      fields: ICustomFieldResponse[]
    ): IFlatCustomField[] => {
      return fields.map(({ id, type, attributes }) => ({
        id,
        type,
        ...attributes,
      }));
    };

    const subscription = surveyCustomFieldsStream(projectId, {
      queryParameters: { input_types: inputTypes },
    }).observable.subscribe((surveyCustomFields) => {
      setSurveyCustomFields(flattenSurveyCustomFields(surveyCustomFields.data));
    });

    return () => subscription.unsubscribe();
  }, [inputTypes, projectId]);

  return {
    surveyCustomFields,
    setSurveyCustomFields,
  };
}
