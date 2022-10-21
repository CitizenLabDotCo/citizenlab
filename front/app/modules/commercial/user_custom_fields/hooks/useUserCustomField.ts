import { useEffect, useState } from 'react';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  IUserCustomField,
  IUserCustomFieldData,
  userCustomFieldStream,
} from '../services/userCustomFields';

export default function useUserCustomField(userCustomFieldId: string) {
  const [userCustomField, setUserCustomField] = useState<
    IUserCustomFieldData | NilOrError
  >(undefined);

  useEffect(() => {
    const observable = userCustomFieldStream(userCustomFieldId).observable;

    const subscription = observable.subscribe(
      (userCustomField: IUserCustomField | NilOrError) => {
        isNilOrError(userCustomField)
          ? setUserCustomField(userCustomField)
          : setUserCustomField(userCustomField.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [userCustomFieldId]);

  return userCustomField;
}
