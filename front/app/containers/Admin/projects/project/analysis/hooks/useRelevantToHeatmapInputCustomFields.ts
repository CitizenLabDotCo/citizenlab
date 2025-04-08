import { ICustomFieldInputType } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';

const useRelevantToHeatmapInputCustomFields = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId?: string;
}) => {
  const inputCustomFieldInputTypes: ICustomFieldInputType[] = [
    'select',
    'multiselect',
    'number',
    'linear_scale',
    'ranking',
    'rating',
    'multiselect_image',
    'sentiment_linear_scale',
  ];

  const { data: inputCustomFields } = useCustomFields({
    projectId,
    phaseId,
    inputTypes: inputCustomFieldInputTypes,
  });

  return (
    inputCustomFields
      // Temporary front-end filter for input custom fields
      ?.filter((customField) =>
        inputCustomFieldInputTypes.includes(customField.input_type)
      )
  );
};

export default useRelevantToHeatmapInputCustomFields;
