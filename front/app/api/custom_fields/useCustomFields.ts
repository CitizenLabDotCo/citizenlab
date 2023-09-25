import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import customFieldsKeys from './keys';
import {
  ICustomFields,
  CustomFieldsKeys,
  ICustomFieldsParameters,
  IFlatCustomField,
} from './types';
import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';

const fetchCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
}: ICustomFieldsParameters) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields`
    : `admin/projects/${projectId}/custom_fields`;

  return fetcher<ICustomFields>({
    path: `/${apiEndpoint}`,
    action: 'get',
    queryParams: {
      input_types: inputTypes,
    },
  });
};

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
}: ICustomFieldsParameters) => {
  const result = useQuery<
    ICustomFields,
    CLErrors,
    ICustomFields,
    CustomFieldsKeys
  >({
    queryKey: customFieldsKeys.list({
      projectId,
      phaseId,
      inputTypes,
    }),
    queryFn: () => fetchCustomFields({ projectId, phaseId, inputTypes }),
  });

  const options = useCustomFieldOptions({
    projectId,
    phaseId,
    customFields: result.data,
  });

  const data: IFlatCustomField[] | undefined = result.data?.data.map(
    (customField) => {
      const optionsForCustomField = options.filter((option) => {
        const relationshipOptionIds =
          customField.relationships.options.data.map((option) => option.id);

        return (
          option.data?.data.id &&
          relationshipOptionIds.includes(option.data?.data.id)
        );
      });

      return {
        ...customField,
        ...customField.attributes,
        options:
          optionsForCustomField.length > 0
            ? optionsForCustomField.map((option) => ({
                id: option.data?.data.id,
                title_multiloc:
                  option.data?.data.attributes.title_multiloc || {},
              }))
            : [],
      };
    }
  );

  return { ...result, data };
};

export default useCustomFields;
