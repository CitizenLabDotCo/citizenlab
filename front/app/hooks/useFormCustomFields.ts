import { useState, useEffect } from 'react';

import {
  ICustomFieldInputType,
  ICustomFieldResponse,
  IFlatCustomField,
  formCustomFieldsStream,
} from '../services/formCustomFields';

interface Props {
  inputTypes?: ICustomFieldInputType[];
  projectId: string;
  phaseId?: string;
}

export default function useFormCustomFields({
  inputTypes,
  projectId,
  phaseId,
}: Props) {
  const [formCustomFields, setFormCustomFields] = useState<
    IFlatCustomField[] | undefined | Error
  >(undefined);

  useEffect(() => {
    // We flatten this to work with the differences in the body of the update structure and that of the get response
    const flattenFormCustomFields = (
      fields: ICustomFieldResponse[]
    ): IFlatCustomField[] => {
      return fields.map(({ id, type, attributes }) => ({
        id,
        type,
        ...attributes,
      }));
    };

    const subscription = formCustomFieldsStream(
      projectId,
      {
        queryParameters: { input_types: inputTypes },
      },
      phaseId
    ).observable.subscribe((formCustomFields) => {
      setFormCustomFields(flattenFormCustomFields(formCustomFields.data));
    });

    return () => subscription.unsubscribe();
  }, [inputTypes, projectId, phaseId]);

  return {
    formCustomFields,
    setFormCustomFields,
  };
}
