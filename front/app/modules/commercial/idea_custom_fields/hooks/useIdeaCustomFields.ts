import { useState, useEffect } from 'react';
import {
  ideaCustomFieldsStream,
  IIdeaCustomFields,
} from '../services/ideaCustomFields';

interface Props {
  projectId: string;
}

export default function useIdeaCustomFields({ projectId }: Props) {
  const [ideaCustomFields, setIdeaCustomFields] = useState<
    IIdeaCustomFields | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = ideaCustomFieldsStream(projectId).observable.subscribe(
      (ideaCustomFields) => {
        setIdeaCustomFields(ideaCustomFields);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return ideaCustomFields;
}
