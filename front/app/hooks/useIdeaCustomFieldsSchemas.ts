import { useState, useEffect } from 'react';
import {
  ideaFormSchemaStream,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import { Observable, of } from 'rxjs';

interface Props {
  projectId: string | null;
  phaseId?: string | null;
}

export default function useIdeaCustomFieldsSchemas({ projectId, phaseId }: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<
    IIdeaFormSchemas | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IIdeaFormSchemas | null> = of(null);

    console.log('useIdeaCustomFieldsSchemas: ', phaseId);
    if (projectId) {
      if (phaseId) {
        observable = ideaFormSchemaStream(projectId, phaseId).observable;
      }
      else {
        observable = ideaFormSchemaStream(projectId, '').observable
      }
    }

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId, phaseId]);

  return ideaCustomFieldsSchemas;
}
