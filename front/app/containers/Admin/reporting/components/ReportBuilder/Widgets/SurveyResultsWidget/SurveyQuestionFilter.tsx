import React, { ChangeEvent } from 'react';
import useProject from '../../../../../../../hooks/useProject';
import useFormResults from '../../../../../../../hooks/useFormResults';
import { isNilOrError } from '../../../../../../../utils/helperUtils';
import { Box } from '@citizenlab/cl2-component-library';
import useLocalize from '../../../../../../../hooks/useLocalize';

type SurveyQuestionFilterProps = {
  projectId: string;
  phaseId: string;
  showQuestions: number[] | undefined;
  onToggleQuestion: (showQuestions: number[]) => void;
};

const SurveyQuestionFilter = ({
  projectId,
  phaseId,
  showQuestions,
  onToggleQuestion,
}: SurveyQuestionFilterProps) => {
  const localize = useLocalize();
  const project = useProject({ projectId });
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  if (isNilOrError(formResults) || isNilOrError(project)) {
    return <Box>There are no questions available for this project/phase.</Box>;
  }

  const { results } = formResults;
  if (results.length === 0) {
    return null;
  }

  // Initialise which questions are checked
  let selectedQuestions: number[] = [];
  if (showQuestions !== undefined) {
    selectedQuestions = showQuestions;
  } else {
    for (let i = 0; i <= results.length - 1; i++) {
      selectedQuestions.push(i);
    }
    onToggleQuestion(selectedQuestions);
  }

  // Add/remove from selected questions
  const toggleQuestion =
    (questionIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      const findIndex = selectedQuestions.indexOf(questionIndex);
      if (findIndex > -1) {
        console.log('removing index', questionIndex);
        // selectedQuestions.splice(findIndex, 1); // Not working
      } else {
        console.log('adding index', questionIndex);
        // selectedQuestions.push(questionIndex); // Not working
      }
      onToggleQuestion(selectedQuestions);
    };

  return (
    <Box mb="20px">
      <h3>Choose which questions to display:</h3>
      {results.map(({ question }, index) => {
        // TODO: Didn't use <Checkbox/> as there seemed no way of giving it an ID
        return (
          <Box key={index} mb="10px">
            <input
              type="checkbox"
              onChange={toggleQuestion(index)}
              value={index}
              checked={selectedQuestions.includes(index)}
            />
            <label>{localize(question)}</label>
          </Box>
        );
      })}
    </Box>
  );
};
export default SurveyQuestionFilter;
