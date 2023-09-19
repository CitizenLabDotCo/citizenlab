import { UseQueryOptions, useQueries } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import customFieldsOptionKeys from './keys';
import { IFormCustomFieldOption, ICustomFieldOptionParameters } from './types';
import { ICustomFields } from 'api/custom_fields/types';

const fetchCustomFieldOptions = ({
  projectId,
  phaseId,
  customFieldId,
  id,
}: ICustomFieldOptionParameters) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields/${customFieldId}/custom_field_options/${id}`
    : `admin/projects/${projectId}/custom_fields/${customFieldId}/custom_field_options/${id}`;

  return fetcher<IFormCustomFieldOption>({
    path: `/${apiEndpoint}`,
    action: 'get',
  });
};

type CustomFieldOptions = Omit<ICustomFieldOptionParameters, 'id'> & {
  customFields?: ICustomFields;
};

type CustomFieldsOptionsReturnType = UseQueryOptions<IFormCustomFieldOption>[];

const useCustomFieldOptions = ({
  projectId,
  phaseId,
  customFields,
}: CustomFieldOptions) => {
  const customFieldsOptionsIds =
    customFields?.data.flatMap((customField) =>
      customField.relationships.options.data.map((option) => option.id)
    ) || [];

  const getCustomFieldIdBasedOnOptionId = (optionId: string) => {
    const customField = customFields?.data.find((customField) =>
      customField.relationships.options.data.find(
        (option) => option.id === optionId
      )
    );
    return customField?.id;
  };

  const queries = customFieldsOptionsIds.map((id) => {
    return {
      queryKey: customFieldsOptionKeys.item({
        id,
      }),
      queryFn: () =>
        fetchCustomFieldOptions({
          projectId,
          phaseId,
          id,
          customFieldId: getCustomFieldIdBasedOnOptionId(id),
        }),
    };
  });
  return useQueries<CustomFieldsOptionsReturnType>({ queries });
};

export default useCustomFieldOptions;
