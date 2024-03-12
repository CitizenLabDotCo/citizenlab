import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { ICustomFields, ICustomFieldResponse } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import useLocalize, { Localize } from 'hooks/useLocalize';

interface Props {
  phaseId: string;
  questionId?: string;
  filterQuestion: (question: ICustomFieldResponse) => boolean;
  label: string;
  onChange: (questionId?: string) => void;
}

const generateOptions = (
  questions: ICustomFields,
  filterQuestion: Props['filterQuestion'],
  localize: Localize
) => {
  const options = questions.data.filter(filterQuestion).map((question) => ({
    value: question.id,
    label: localize(question.attributes.title_multiloc),
  }));

  return [{ value: '', label: '' }, ...options];
};

const QuestionSelect = ({
  phaseId,
  questionId,
  filterQuestion,
  label,
  onChange,
}: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { data: questions } = useRawCustomFields({ phaseId });
  const localize = useLocalize();

  const handleChange = ({ value }: IOption) => {
    onChange(value === '' ? undefined : value);
  };

  const questionOptions = questions
    ? generateOptions(questions, filterQuestion, localize)
    : [];

  if (phase?.data.attributes.participation_method !== 'native_survey') {
    return null;
  }

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
