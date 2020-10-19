import { useState, useEffect } from 'react';
import {
  userCustomFieldOptionsStream,
  IUserCustomFieldOptionsData,
} from 'services/userCustomFields';

interface Props {
  customFieldId: string;
}

export default function useUserCustomFieldOptions({ customFieldId }: Props) {
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
