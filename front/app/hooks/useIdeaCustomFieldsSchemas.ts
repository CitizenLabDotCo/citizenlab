import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  ideaJsonFormsSchemaStream,
  IIdeaJsonFormSchemas,
} from 'services/ideaJsonFormsSchema';

interface Props {
  projectId: string | null;
  phaseId?: string | null;
  inputId?: string;
}

export default function useIdeaCustomFieldsSchemas({
  projectId,
  phaseId,
  inputId,
}: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<
    undefined | null | Error | IIdeaJsonFormSchemas
  >(undefined);

  useEffect(() => {
    let observable: Observable<IIdeaJsonFormSchemas | Error | null> = of(null);

    if (!projectId) {
      return;
    }

    observable = ideaJsonFormsSchemaStream(
      projectId,
      phaseId,
      inputId || undefined
    ).observable;

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId, inputId, phaseId]);

  return ideaCustomFieldsSchemas;
}
