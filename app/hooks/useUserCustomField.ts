import { useState, useEffect } from 'react';
import {
  userCustomFieldStream,
  IUserCustomFieldData,
} from 'services/userCustomFields';

export default function useUserCustomField(userCustomFieldId: string) {
  const [userCustomField, setUserCustomField] = useState<
    IUserCustomFieldData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = userCustomFieldStream(
      userCustomFieldId
    ).observable.subscribe((userCustomField) => {
      setUserCustomField(userCustomField.data);
    });

    return () => subscription.unsubscribe();
  }, [userCustomFieldId]);

  return userCustomField;
}
