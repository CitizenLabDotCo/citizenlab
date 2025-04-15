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

  return inputCustomFields;
};

export default useRelevantToHeatmapInputCustomFields;
