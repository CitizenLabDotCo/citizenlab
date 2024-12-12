import { useMemo } from 'react';

import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';

import { ICustomFieldsParameters } from './types';
import useRawCustomFields from './useRawCustomFields';

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
}: ICustomFieldsParameters) => {
  const result = useRawCustomFields({ projectId, phaseId, inputTypes, copy });

  const options = useCustomFieldOptions({
    projectId,
    phaseId,
    customFields: result.data,
  });

  const data = useMemo(() => {
    if (!result.data?.data) return undefined;

    return result.data.data.map((customField) => {
      const optionsForCustomField = options.filter((option) => {
        const relationshipOptionIds =
          customField.relationships.options.data.map((option) => option.id);

        return (
          option.data?.data.id &&
          relationshipOptionIds.includes(option.data.data.id)
        );
      });

      return {
        ...customField,
        ...customField.attributes,
        map_config: customField.relationships.map_config,
        map_config_id: customField.relationships.map_config?.data?.id,
        options:
          optionsForCustomField.length > 0
            ? optionsForCustomField.map((option) => ({
                id: option.data?.data.id,
                title_multiloc:
                  option.data?.data.attributes.title_multiloc || {},
                other: option.data?.data.attributes.other || false,

                image_id: option.data?.data.relationships.image?.data?.id,
                temp_id: option.data?.data.attributes.temp_id,
              }))
            : [],
      };
    });
  }, [result.data?.data, options]);

  return { ...result, data };
};

export default useCustomFields;
