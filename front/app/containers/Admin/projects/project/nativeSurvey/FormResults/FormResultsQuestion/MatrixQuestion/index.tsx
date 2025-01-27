import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocale from 'hooks/useLocale';

import {
  getColourByPercentage,
  getLinearScaleLabelsArray,
  getPercentage,
  getPercentageTextBorder,
  getStatementsWithResultsArray,
  StickyTd,
  StledTh,
} from './utils';

type Props = {
  result: ResultUngrouped;
};

const MatrixQuestion = ({ result }: Props) => {
  const theme = useTheme();
  const locale = useLocale();

  // Create arrays for the statements & answers and linear scale labels
  const statementsWithResults = getStatementsWithResultsArray(result);
  const linearScaleLabels = getLinearScaleLabelsArray(result);

  return (
    <Box pt="16px" width="100%" maxWidth="100vw" overflowX="auto">
      <table style={{ borderCollapse: 'separate', borderSpacing: '8px 8px' }}>
        <thead>
          <th />
          {linearScaleLabels.map((linearScaleMultiloc) => (
            <StledTh key={linearScaleMultiloc.value}>
              <Text m="0px">{linearScaleMultiloc.label[locale]}</Text>
            </StledTh>
          ))}
        </thead>

        <tbody>
          {statementsWithResults.map((statementWithResult) => (
            <tr
              key={statementWithResult.statementKey}
              style={{ background: theme.colors.tenantPrimaryLighten95 }}
            >
              <StickyTd
                key={statementWithResult.statementKey}
                style={{ background: 'white' }}
              >
                <Box display="flex" minHeight="100px">
                  <Text m="0px" my="auto">
                    {statementWithResult.statementMultiloc[locale]}
                  </Text>
                </Box>
              </StickyTd>
              <>
                {linearScaleLabels.map((linearScaleLabel) => {
                  const percentage = getPercentage(
                    statementWithResult,
                    linearScaleLabel
                  );

                  return (
                    <td
                      key={linearScaleLabel.value}
                      style={{
                        background:
                          percentage &&
                          getColourByPercentage(
                            percentage,
                            theme.colors.tenantPrimary
                          ),
                      }}
                    >
                      <Box display="flex" justifyContent="center">
                        <Text
                          my="auto"
                          p="0px"
                          fontSize="s"
                          color={percentage >= 75 ? 'white' : 'textPrimary'}
                          style={{
                            textShadow: getPercentageTextBorder(percentage),
                          }}
                          fontWeight="semi-bold"
                        >
                          {`${percentage}%`}
                        </Text>
                      </Box>
                    </td>
                  );
                })}
              </>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default MatrixQuestion;
