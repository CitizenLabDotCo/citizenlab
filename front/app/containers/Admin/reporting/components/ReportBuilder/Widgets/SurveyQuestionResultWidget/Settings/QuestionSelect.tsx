import React, { useMemo } from 'react';

// api
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { ICustomFields, ICustomFieldInputType } from 'api/custom_fields/types';

interface Props {
  phaseId: string;
  questionId?: string;
  inputTypes: ICustomFieldInputType[];
  onChange: (questionId?: string) => void;
}

const generateOptions = (questions: ICustomFields, localize: Localize) => {
  const options = questions.data.map((question) => ({
    value: question.id,
    label: localize(question.attributes.title_multiloc),
  }));

  return [{ value: '', label: '' }, ...options];
};

const QuestionSelect = ({
  phaseId,
  questionId,
  inputTypes,
  onChange,
}: Props) => {
  const { data: questions } = useRawCustomFields({ phaseId, inputTypes });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleChange = ({ value }: IOption) => {
    onChange(value === '' ? undefined : value);
  };

  const questionOptions = useMemo(() => {
    return questions ? generateOptions(questions, localize) : [];
  }, [questions, localize]);

  return (
    <Box width="100%" mb="20px">
      <Select
        label={formatMessage(messages.question)}
        value={questionId}
        options={questionOptions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default QuestionSelect;
