import { useEffect, useState } from 'react';
import {
  IUserCustomFieldOptionData,
  userCustomFieldOptionsStream,
} from '../services/userCustomFieldOptions';

export default function useUserCustomFieldOptions(customFieldId: string) {
  const [userCustomFieldOptions, setUserCustomFieldOptions] = useState<
    IUserCustomFieldOptionData[] | undefined | null | Error
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
