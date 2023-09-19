import { useState, useEffect } from 'react';

import {
  formCustomFieldsResultsStream,
  SurveyResultData,
} from '../services/formCustomFields';

interface Props {
  projectId: string;
  phaseId?: string | null;
}

export default function useFormResults({ projectId, phaseId }: Props) {
  const [results, setResults] = useState<
    SurveyResultData['attributes'] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = formCustomFieldsResultsStream(
      projectId,
      {
        queryParameters: {},
      },
      phaseId
    ).observable.subscribe((results) => {
      setResults(results.data.attributes);
    });

    return () => subscription.unsubscribe();
  }, [projectId, phaseId]);

  return results;
}
