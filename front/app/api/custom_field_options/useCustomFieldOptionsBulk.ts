import { UseQueryOptions, useQueries } from '@tanstack/react-query';

import { ICustomFields } from 'api/custom_fields/types';

import customFieldsOptionKeys from './keys';
import { ICustomFieldOption } from './types';
import { fetchOption } from './useCustomFieldOption';

type CustomFieldsOptionsReturnType = UseQueryOptions<ICustomFieldOption>[];

/** Fetch all customFieldOptions for all given customFields */
const useCustomFieldOptionsBulk = ({
  customFields,
}: {
  customFields?: ICustomFields;
}) => {
  const customFieldsOptionsIds =
    customFields?.data.flatMap((customField) =>
      customField.relationships.options.data.map((option) => option.id)
    ) || [];

  const queries = customFieldsOptionsIds.map((id) => {
    return {
      queryKey: customFieldsOptionKeys.item({
        optionId: id,
      }),
      queryFn: () => fetchOption({ optionId: id }),
    };
  });
  return useQueries<CustomFieldsOptionsReturnType>({ queries });
};

export default useCustomFieldOptionsBulk;
