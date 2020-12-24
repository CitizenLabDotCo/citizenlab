import { useState, useEffect } from 'react';
import {
  userCustomFieldOptionStream,
  IUserCustomFieldOptionData,
} from 'services/userCustomFieldOptions';

export default function useUserCustomFieldOption(
  userCustomFieldId: string,
  userCustomFieldOptionId: string
) {
  const [userCustomFieldOption, setUserCustomFieldOption] = useState<
    IUserCustomFieldOptionData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = userCustomFieldOptionStream(
      userCustomFieldId,
      userCustomFieldOptionId
    ).observable.subscribe((userCustomFieldOption) => {
      setUserCustomFieldOption(userCustomFieldOption.data);
    });

    return () => subscription.unsubscribe();
  }, [userCustomFieldOptionId]);

  return userCustomFieldOption;
}
