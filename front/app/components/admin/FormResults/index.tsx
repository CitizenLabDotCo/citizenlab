import React, { useState, useMemo } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import { ResultUngrouped } from 'api/survey_results/types';
import useFormResults from 'api/survey_results/useSurveyResults';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { useIntl } from 'utils/cl-intl';

import FormResultsPage from './FormResultsPage';
import FormResultsQuestion from './FormResultsQuestion';
import messages from './messages';

interface ResultGroup {
  page: ResultUngrouped | null;
  firstQuestion: ResultUngrouped | null;
  remainingQuestions: ResultUngrouped[];
}

/**
 * Groups survey results for PDF export with proper page breaks.
 * Each group contains a page header + first question (kept together in PageBreakBox)
 * and remaining questions rendered separately.
 */
const groupResultsForPdfExport = (
  results: ResultUngrouped[]
): ResultGroup[] => {
  const groups: ResultGroup[] = [];
  let currentGroup: ResultGroup = {
    page: null,
    firstQuestion: null,
    remainingQuestions: [],
  };

  const hasContent = (group: ResultGroup) =>
    group.page || group.firstQuestion || group.remainingQuestions.length > 0;

  results.forEach((result) => {
    if (result.inputType === 'page') {
      if (hasContent(currentGroup)) {
        groups.push(currentGroup);
      }
      currentGroup = {
        page: result,
        firstQuestion: null,
        remainingQuestions: [],
      };
    } else if (currentGroup.page && !currentGroup.firstQuestion) {
      currentGroup.firstQuestion = result;
    } else {
      currentGroup.remainingQuestions.push(result);
    }
  });

  if (hasContent(currentGroup)) {
    groups.push(currentGroup);
  }

  return groups;
};

type Props = {
  projectId?: string;
  phaseId?: string;
  isPdfExport?: boolean;
};

const FormResults = (props: Props) => {
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const projectId = props.projectId || projectIdParam;
  const phaseId = props.phaseId || phaseIdParam;

  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const [filterLogicIds, setFilterLogicIds] = useState<string[]>(
    [] // Array of page or option ids to pass to the API
  );
  const { data: formResults, isLoading: isLoadingResults } = useFormResults({
    phaseId,
    filterLogicIds,
  });

  const results = useMemo(
    () => formResults?.data.attributes.results ?? [],
    [formResults?.data.attributes.results]
  );
  const totalSubmissions = formResults?.data.attributes.totalSubmissions ?? 0;

  const groupedResults = useMemo(() => {
    if (!props.isPdfExport || results.length === 0) return null;
    return groupResultsForPdfExport(results);
  }, [results, props.isPdfExport]);

  if (!formResults || !project) {
    return null;
  }

  const toggleLogicIds = (logicId: string) => {
    if (filterLogicIds.includes(logicId)) {
      setFilterLogicIds(filterLogicIds.filter((id) => id !== logicId));
    } else {
      setFilterLogicIds([...filterLogicIds, logicId]);
    }
  };

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  const logicConfig = {
    toggleLogicIds,
    filterLogicIds,
    isLoading: isLoadingResults,
  };

  if (props.isPdfExport && groupedResults) {
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
  }

  return (
    <Box width="100%">
      <Title variant="h3" as="h2" color="textPrimary" m="0px" mb="16px">
        {formatMessage(messages.questions)}
      </Title>
      <Text variant="bodyM" color="textSecondary">
        {surveyResponseMessage}
      </Text>
      <Box mt="24px">
        {totalSubmissions > 0 &&
          results.map((result, index) => {
            if (result.inputType === 'page') {
              return (
                <FormResultsPage
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                />
              );
            } else {
              return (
                <FormResultsQuestion
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                  isPdfExport={false}
                />
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default FormResults;
