import React from 'react';

// components
import { Box, colors, Image } from '@citizenlab/cl2-component-library';
import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';

// typings
import { Answer } from 'api/survey_results/types';

// hooks
import useLocalize from 'hooks/useLocalize';

interface Props {
  multipleChoiceAnswers: Answer[];
  totalResponses: number;
}

const COLOR_SCHEME = [colors.primary];

const MultipleChoice = ({ multipleChoiceAnswers, totalResponses }: Props) => {
  const localize = useLocalize();

  return (
    <>
      {multipleChoiceAnswers.map(({ answer, responses, image }, index) => {
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
                  alt={localize(answer)}
                />
              </Box>
            )}
            <ProgressBars2
              values={[responses]}
              total={totalResponses}
              colorScheme={COLOR_SCHEME}
              label={localize(answer)}
            />
          </Box>
        );
      })}
    </>
  );
};

export default MultipleChoice;
