import { useState, useEffect } from 'react';
import {
  userCustomFieldOptionsStream,
  IUserCustomFieldOptionsData,
} from 'services/userCustomFields';

export default function useUserCustomFieldOptions(customFieldId: string) {
  const [userCustomFieldOptions, setUserCustomFieldOptions] = useState<
    IUserCustomFieldOptionsData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = userCustomFieldOptionsStream(
      customFieldId
    ).observable.subscribe((userCustomFieldOptions) => {
      setUserCustomFieldOptions(userCustomFieldOptions.data);
    });

    return () => subscription.unsubscribe();
  }, [customFieldId]);

  return userCustomFieldOptions;
}
