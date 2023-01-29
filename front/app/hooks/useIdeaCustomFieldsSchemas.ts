import { useState, useEffect } from 'react';
import {
  ideaFormSchemaStream,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import { Observable, of } from 'rxjs';
import {
  ideaJsonFormsSchemaStream,
  IIdeaJsonFormSchemas,
} from 'services/ideaJsonFormsSchema';
import useFeatureFlag from './useFeatureFlag';

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
    IIdeaFormSchemas | undefined | null | Error | IIdeaJsonFormSchemas
  >(undefined);

  const ideaCustomFieldsIsEnabled = useFeatureFlag({
    name: 'idea_custom_fields',
  });
  const dynamicIdeaFormIsEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });

  useEffect(() => {
    let observable: Observable<
      IIdeaFormSchemas | IIdeaJsonFormSchemas | Error | null
    > = of(null);

    if (
      !projectId ||
      typeof ideaCustomFieldsIsEnabled !== 'boolean' ||
      typeof dynamicIdeaFormIsEnabled !== 'boolean'
    ) {
      return;
    }

    if (dynamicIdeaFormIsEnabled && ideaCustomFieldsIsEnabled) {
      observable = ideaJsonFormsSchemaStream(
        projectId,
        phaseId,
        inputId || undefined
      ).observable;
    } else {
      observable = ideaFormSchemaStream(projectId, phaseId, inputId).observable;
    }

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [
    projectId,
    inputId,
    phaseId,
    ideaCustomFieldsIsEnabled,
    dynamicIdeaFormIsEnabled,
  ]);

  return ideaCustomFieldsSchemas;
}
