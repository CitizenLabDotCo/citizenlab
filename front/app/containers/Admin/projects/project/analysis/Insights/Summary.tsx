import React from 'react';
import { useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';

import useDeleteAnalysisSummary from 'api/analysis_summaries/useDeleteAnalysisSummary';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { ISummary } from 'api/analysis_summaries/types';

import {
  Box,
  Icon,
  IconButton,
  Spinner,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';

const StyledSummaryText = styled.div`
  white-space: pre-wrap;
`;

const StyledButton = styled.button`
  padding: 0px;
  cursor: pointer;
`;

type Props = {
  summary: ISummary['data'];
  onSelectInput: (inputId: string) => void;
};

const Summary = ({ summary, onSelectInput }: Props) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteSummary } = useDeleteAnalysisSummary();

  const { data: backgroundTask } = useAnalysisBackgroundTask(
    analysisId,
    summary.relationships.background_task.data.id
  );
  const processing =
    backgroundTask?.data.attributes.state === 'in_progress' ||
    backgroundTask?.data.attributes.state === 'queued';

  const handleSummaryDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteSummaryConfirmation))) {
      deleteSummary({
        analysisId,
        id,
      });
    }
  };

  const replaceIdRefsWithLinks = (summary) => {
    return reactStringReplace(
      summary,
      /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g,
      (match) => (
        <StyledButton onClick={() => onSelectInput(match)}>
          <Icon name="search" />
        </StyledButton>
      )
    );
  };

  const hasFilters = !!Object.keys(summary.attributes.filters).length;

  return (
    <Box
      key={summary.id}
      bgColor={colors.teal100}
      p="16px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
    >
      <Box p="16px">
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="4px"
          mb="12px"
        >
          {hasFilters && (
            <>
              <Box>Summary for</Box>
              {Object.entries(summary.attributes.filters).map(([k, v]) => (
                <Box
                  key={k}
                  bgColor={colors.teal200}
                  color={colors.teal700}
                  py="2px"
                  px="4px"
                  borderRadius={stylingConsts.borderRadius}
                >
                  {k}: {v}
                </Box>
              ))}
            </>
          )}

          {!hasFilters && (
            <>
              <Box>Summary</Box>
            </>
          )}
        </Box>
        <Box>
          <StyledSummaryText>
            {replaceIdRefsWithLinks(summary.attributes.summary)}
          </StyledSummaryText>
          {processing && <Spinner />}
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row-reverse"
        gap="4px"
        alignItems="center"
      >
        <IconButton
          iconName="delete"
          onClick={() => handleSummaryDelete(summary.id)}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
        />
        {summary.attributes.accuracy && (
          <Box color={colors.teal700}>
            Accuracy {summary.attributes.accuracy * 100}%
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Summary;
