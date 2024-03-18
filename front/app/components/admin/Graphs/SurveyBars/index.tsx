import React from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';

import {
  GroupedAnswer,
  AnswerMultilocsGrouped,
} from 'api/graph_data_units/responseTypes';
import { Answer, AnswerMultilocs } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import BarsPerOption from './BarsPerOption';
import messages from './messages';

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
  const { formatMessage } = useIntl();

  return (
    <>
      {props.answers.map(({ answer, count }, index) => {
        const { multilocs, totalResponses, colorScheme } = props;

        const image = answer ? multilocs.answer[answer].image : undefined;
        const label =
          answer === null
            ? formatMessage(messages.noAnswer)
            : localize(multilocs.answer[answer].title_multiloc);

        const values = props.grouped
          ? props.answers[index].groups.map((group) => group.count)
          : [count];

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
              values={values}
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
