import { useEffect, useState } from 'react';
import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
  userCustomFieldsStream,
} from '../services/userCustomFields';

interface Props {
  inputTypes?: IUserCustomFieldInputType[];
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
