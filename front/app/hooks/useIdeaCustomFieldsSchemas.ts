import { useState, useEffect } from 'react';
import {
  ideaFormSchemaStream,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import { Observable, of } from 'rxjs';

interface Props {
  projectId: string | null;
}

export default function useIdeaCustomFieldsSchemas({ projectId }: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<
    IIdeaFormSchemas | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IIdeaFormSchemas | null> = of(null);

    if (projectId) {
      observable = ideaFormSchemaStream(projectId).observable;
    }

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return ideaCustomFieldsSchemas;
}
