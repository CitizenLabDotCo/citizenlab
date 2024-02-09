import { ICustomFieldsParameters, IFlatCustomField } from './types';
import useRawCustomFields from './useRawCustomFields';
import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
}: ICustomFieldsParameters) => {
  const result = useRawCustomFields({ projectId, phaseId, inputTypes });

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
