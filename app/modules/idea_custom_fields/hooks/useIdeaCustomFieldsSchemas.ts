import { useState, useEffect } from 'react';
import {
  ideaCustomFieldsSchemasStream,
  IIdeaCustomFieldsSchemas,
} from '../services/ideaCustomFields';
import { Observable, of } from 'rxjs';

interface Props {
  projectId: string | null;
}

export default function useIdeaCustomFieldsSchemas({ projectId }: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<
    IIdeaCustomFieldsSchemas | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IIdeaCustomFieldsSchemas | null> = of(null);

    if (projectId) {
      observable = ideaCustomFieldsSchemasStream(projectId).observable;
    }

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return ideaCustomFieldsSchemas;
}
