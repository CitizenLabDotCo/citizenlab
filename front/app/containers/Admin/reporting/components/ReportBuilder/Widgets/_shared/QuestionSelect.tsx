import React, { useMemo } from 'react';

// api
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { ICustomFields, ICustomFieldInputType } from 'api/custom_fields/types';

interface Props {
  phaseId: string;
  questionId?: string;
  inputTypes: ICustomFieldInputType[];
  label: string;
  onChange: (questionId?: string) => void;
}

const generateOptions = (
  questions: ICustomFields,
  inputTypes: ICustomFieldInputType[],
  localize: Localize
) => {
  const inputTypesSet = new Set(inputTypes);

  const options = questions.data
    .filter((question) => inputTypesSet.has(question.attributes.input_type))
    .map((question) => ({
      value: question.id,
      label: localize(question.attributes.title_multiloc),
    }));

  return [{ value: '', label: '' }, ...options];
};

const QuestionSelect = ({
  phaseId,
  questionId,
  inputTypes,
  label,
  onChange,
}: Props) => {
  const { data: questions } = useRawCustomFields({ phaseId });
  const localize = useLocalize();

  const handleChange = ({ value }: IOption) => {
    onChange(value === '' ? undefined : value);
  };

  const inputTypesStr = JSON.stringify(inputTypes);
  const questionOptions = useMemo(() => {
    if (!questions) return [];

    const inputTypes: ICustomFieldInputType[] = JSON.parse(inputTypesStr);
    return generateOptions(questions, inputTypes, localize);
  }, [questions, inputTypesStr, localize]);

  return (
    <Box width="100%" mb="20px">
      <Select
        className="e2e-question-select"
        label={label}
        value={questionId}
        options={questionOptions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default QuestionSelect;
