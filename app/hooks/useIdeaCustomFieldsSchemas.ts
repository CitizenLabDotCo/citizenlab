import { useState, useEffect } from 'react';
import { ideaCustomFieldsSchemasStream, IIdeaCustomFieldsSchemas } from 'services/ideaCustomFields';

interface Props {
  projectId: string;
}

export default function useIdeaCustomFieldsSchemas({ projectId }: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<IIdeaCustomFieldsSchemas | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = ideaCustomFieldsSchemasStream(projectId).observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return ideaCustomFieldsSchemas;
}
