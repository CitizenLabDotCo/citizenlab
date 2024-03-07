import React from 'react';

// components
import { Box, colors, Image } from '@citizenlab/cl2-component-library';
import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';

// typings
import { Answer, AnswerMultilocs } from 'api/survey_results/types';

// hooks
import useLocalize from 'hooks/useLocalize';

interface Props {
  multipleChoiceAnswers: Answer[];
  totalResponses: number;
  multilocs?: AnswerMultilocs;
}

const COLOR_SCHEME = [colors.primary];

const MultipleChoice = ({
  multipleChoiceAnswers,
  totalResponses,
  multilocs,
}: Props) => {
  const localize = useLocalize();

  return (
    <>
      {multipleChoiceAnswers.map(({ answer, count }, index) => {
        if (!multilocs || answer === null) return null;

        const label = localize(multilocs.answer[answer].title_multiloc);
        const image = multilocs.answer[answer].image;

        return (
          <Box
            key={index}
            maxWidth="524px"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            {image?.small && (
              <Box mr="12px">
                <Image
                  width="48px"
                  height="48px"
                  src={image.small}
                  alt={label}
                />
              </Box>
            )}
            <ProgressBars2
              values={[count]}
              total={totalResponses}
              colorScheme={COLOR_SCHEME}
              label={label}
            />
          </Box>
        );
      })}
    </>
  );
};

export default MultipleChoice;
