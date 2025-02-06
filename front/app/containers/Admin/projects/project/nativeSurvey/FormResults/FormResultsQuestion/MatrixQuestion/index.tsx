import React from 'react';

import {
  Box,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import {
  getPrimaryColourByPercentage,
  getLinearScaleLabelsArray,
  getPercentage,
  getPercentageTextBorder,
  getStatementsWithResultsArray,
  StickyTd,
  StyledTd,
} from './utils';

type Props = {
  result: ResultUngrouped;
};

const MatrixQuestion = ({ result }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();

  // Create arrays for the statements & answers and linear scale
  // labels so they are easier to work with.
  const statementsWithResults = getStatementsWithResultsArray(result);
  const linearScaleLabels = getLinearScaleLabelsArray(result);

  return (
    <Box overflowX="auto">
      <Table borderSpacing="8px 8px" display="block">
        <Thead>
          <Tr>
            <Th borderBottom="none !important" />
            {linearScaleLabels.map((linearScaleMultiloc) => (
              <Th
                width="84px"
                minWidth="84px"
                borderBottom="none !important"
                key={linearScaleMultiloc.value}
              >
                <Text m="0px">{linearScaleMultiloc.label[locale]}</Text>
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {statementsWithResults.map((statementWithResult) => (
            <Tr key={statementWithResult.statementKey}>
              <StickyTd>
                <Box display="flex" minHeight="80px">
                  <Text m="0px" my="auto">
                    {statementWithResult.statementMultiloc[locale]}
                  </Text>
                </Box>
              </StickyTd>
              <>
                {linearScaleLabels.map((linearScaleLabel) => {
                  // Get percentage of respondents who chose this value
                  const percentage = getPercentage(
                    statementWithResult,
                    linearScaleLabel
                  );

                  // Get # of respondents who chose this value
                  const respondentCount = statementWithResult.answers.find(
                    (answer) => answer.answer === linearScaleLabel.value
                  )?.count;

                  return (
                    <StyledTd
                      key={linearScaleLabel.value}
                      background={getPrimaryColourByPercentage(percentage)}
                    >
                      <Box display="flex" justifyContent="center">
                        <Tooltip
                          content={formatMessage(messages.respondentsTooltip, {
                            respondentCount: respondentCount || 0,
                          })}
                        >
                          <Text
                            my="auto"
                            fontSize="s"
                            color={percentage >= 75 ? 'white' : 'textPrimary'}
                            textShadow={getPercentageTextBorder(percentage)}
                            fontWeight="semi-bold"
                          >
                            {`${percentage}%`}
                          </Text>
                        </Tooltip>
                      </Box>
                    </StyledTd>
                  );
                })}
              </>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default MatrixQuestion;
