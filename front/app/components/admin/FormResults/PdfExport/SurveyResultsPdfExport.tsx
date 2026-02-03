import React, { useMemo } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { useIntl } from 'utils/cl-intl';

import FormResultsPage from '../FormResultsPage';
import FormResultsQuestion from '../FormResultsQuestion';
import messages from '../messages';
import useSurveyResultsData from '../useSurveyResultsData';

import { groupResultsForPdfExport } from './utils';

interface Props {
  projectId?: string;
  phaseId?: string;
}

const SurveyResultsPdfExport = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const { results, totalSubmissions, logicConfig, isReady } =
    useSurveyResultsData({ projectId, phaseId });

  const groupedResults = useMemo(() => {
    if (results.length === 0) return null;
    return groupResultsForPdfExport(results);
  }, [results]);

  if (!isReady || !groupedResults) {
    return null;
  }

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  const firstGroup = groupedResults[0];
  const remainingGroups = groupedResults.slice(1);

  return (
    <Box width="100%">
      <PageBreakBox>
        <Title variant="h3" as="h2" color="textPrimary" m="0px" mb="16px">
          {formatMessage(messages.questions)}
        </Title>
        <Text variant="bodyM" color="textSecondary" mb="24px">
          {surveyResponseMessage}
        </Text>
        {totalSubmissions > 0 && (
          <>
            {firstGroup.page && (
              <FormResultsPage
                result={firstGroup.page}
                totalSubmissions={totalSubmissions}
                logicConfig={logicConfig}
              />
            )}
            {firstGroup.firstQuestion && (
              <FormResultsQuestion
                result={firstGroup.firstQuestion}
                totalSubmissions={totalSubmissions}
                logicConfig={logicConfig}
                isPdfExport={true}
              />
            )}
          </>
        )}
      </PageBreakBox>

      {firstGroup.remainingQuestions.map((result, qIndex) => (
        <FormResultsQuestion
          key={`0-${qIndex}`}
          result={result}
          totalSubmissions={totalSubmissions}
          logicConfig={logicConfig}
          isPdfExport={true}
        />
      ))}

      {remainingGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex + 1}>
          {(group.page || group.firstQuestion) && (
            <PageBreakBox>
              {group.page && (
                <FormResultsPage
                  result={group.page}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                />
              )}
              {group.firstQuestion && (
                <FormResultsQuestion
                  result={group.firstQuestion}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                  isPdfExport={true}
                />
              )}
            </PageBreakBox>
          )}
          {group.remainingQuestions.map((result, qIndex) => (
            <FormResultsQuestion
              key={`${groupIndex + 1}-${qIndex}`}
              result={result}
              totalSubmissions={totalSubmissions}
              logicConfig={logicConfig}
              isPdfExport={true}
            />
          ))}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default SurveyResultsPdfExport;
