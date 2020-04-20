import { useState, useEffect } from 'react';
import { ideaCustomFieldStream, IIdeaCustomField } from 'services/ideaCustomFields';

interface Props {
  projectId: string;
  customFieldCode: string; // TODO: add types
}

export default function useIdeaCustomFields({ projectId, customFieldCode }: Props) {
  const [ideaCustomField, setIdeaCustomField] = useState<IIdeaCustomField | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = ideaCustomFieldStream(projectId, customFieldCode).observable.subscribe((ideaCustomField) => {
      setIdeaCustomField(ideaCustomField);
    });

    return () => subscription.unsubscribe();
  }, [projectId, customFieldCode]);

  return ideaCustomField;
}
