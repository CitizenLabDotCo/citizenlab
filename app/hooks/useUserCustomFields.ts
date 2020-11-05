import { useState, useEffect } from 'react';
import {
  userCustomFieldsStream,
  IUserCustomFieldData,
} from 'services/userCustomFields';

type IInputType = 'select' | 'multiselect' | 'checkbox' | 'number';

interface Props {
  inputTypes?: IInputType[];
  cache?: boolean;
}

export default function useUserCustomFields({ inputTypes }: Props) {
  const [userCustomFields, setUserCustomFields] = useState<
    IUserCustomFieldData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = userCustomFieldsStream({
      queryParameters: { input_types: inputTypes },
    }).observable.subscribe((userCustomFields) => {
      setUserCustomFields(userCustomFields.data);
    });

    return () => subscription.unsubscribe();
  }, [inputTypes]);

  return userCustomFields;
}
