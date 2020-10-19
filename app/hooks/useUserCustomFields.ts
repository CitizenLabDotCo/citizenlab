import { useState, useEffect } from 'react';
import {
  userCustomFieldsStream,
  IUserCustomFieldData,
} from 'services/userCustomFields';
import { isBoolean } from 'lodash-es';

type IInputType = 'select' | 'multiselect' | 'checkbox' | 'number';

interface Props {
  inputTypes?: IInputType[];
  cache?: boolean;
}

export default function useUserCustomFields({ inputTypes, cache }: Props) {
  const [userCustomFields, setUserCustomFields] = useState<
    IUserCustomFieldData[] | undefined | null | Error
  >(undefined);
  const useCacheStream = isBoolean(cache) ? cache : true;

  useEffect(() => {
    const subscription = userCustomFieldsStream({
      cacheStream: useCacheStream,
      queryParameters: { input_types: inputTypes },
    }).observable.subscribe((userCustomFields) => {
      setUserCustomFields(userCustomFields.data);
    });

    return () => subscription.unsubscribe();
  }, [inputTypes, cache]);

  return userCustomFields;
}
