import React from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';

import {
  GroupedAnswer,
  AnswerMultilocsGrouped,
} from 'api/graph_data_units/responseTypes';
import { Answer, AnswerMultilocs } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import BarsPerOption from './BarsPerOption';

interface UngroupedProps {
  grouped: false;
  answers: Answer[];
  multilocs: AnswerMultilocs;
  totalResponses: number;
  colorScheme: string[];
}

interface GroupedProps {
  grouped: true;
  answers: GroupedAnswer[];
  multilocs: AnswerMultilocsGrouped;
  totalResponses: number;
  colorScheme: string[];
}

type Props = UngroupedProps | GroupedProps;

const SurveyBars = (props: Props) => {
  const localize = useLocalize();

  return (
    <>
      {props.answers.map(({ answer, count }, index) => {
        const { multilocs, totalResponses, colorScheme } = props;

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
            <BarsPerOption
              values={[count]}
              total={totalResponses}
              colorScheme={colorScheme}
              label={label}
            />
          </Box>
        );
      })}
    </>
  );
};

export default SurveyBars;
