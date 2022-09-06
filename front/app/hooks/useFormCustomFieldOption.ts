import { useState, useEffect } from 'react';
import {
  formCustomFieldOptionStream,
  IFormCustomFieldOptionData,
} from '../services/formCustomFields';

export default function useFormCustomFieldOption(
  projectId: string,
  formCustomFieldId: string,
  formCustomFieldOptionId: string,
  phaseId?: string
) {
  const [formCustomFieldOption, setFormCustomFieldOption] = useState<
    IFormCustomFieldOptionData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = formCustomFieldOptionStream(
      projectId,
      formCustomFieldId,
      formCustomFieldOptionId,
      null,
      phaseId
    ).observable.subscribe((formCustomFieldOption) => {
      setFormCustomFieldOption(formCustomFieldOption.data);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formCustomFieldOptionId]);

  return formCustomFieldOption;
}
