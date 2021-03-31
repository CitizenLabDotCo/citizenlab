import { useState, useEffect } from 'react';
import {
  ideaCustomFieldStream,
  IIdeaCustomField,
  IIdeaCustomFieldData,
} from '../services/ideaCustomFields';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';
import { Observable, of } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId: string | null;
  customFieldCode: CustomFieldCodes;
}

export default function useIdeaCustomFields({
  projectId,
  customFieldCode,
}: Props) {
  const [ideaCustomField, setIdeaCustomField] = useState<
    IIdeaCustomFieldData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IIdeaCustomField | null> = of(null);

    if (projectId) {
      observable = ideaCustomFieldStream(projectId, customFieldCode).observable;
    }

    const subscription = observable.subscribe((response) => {
      const ideaCustomField = !isNilOrError(response)
        ? response.data
        : response;
      setIdeaCustomField(ideaCustomField);
    });

    return () => subscription.unsubscribe();
  }, [projectId, customFieldCode]);

  return ideaCustomField;
}
