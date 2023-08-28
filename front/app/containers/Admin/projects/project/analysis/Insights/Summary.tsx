import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';

import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { IInsightData } from 'api/analysis_insights/types';

import {
  Box,
  Icon,
  IconButton,
  Spinner,
  colors,
  stylingConsts,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import { useSelectedInputContext } from '../SelectedInputContext';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import Tag from '../Tags/Tag';
import FilterItems from '../FilterItems';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Rate from './Rate';

const StyledSummaryText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledButton = styled.button`
  padding: 0px;
  cursor: pointer;
`;

type Props = {
  insight: IInsightData;
};

const Summary = ({ insight }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteSummary } = useDeleteAnalysisInsight();
  const { data: tags } = useAnalysisTags({ analysisId });

  const { data: summary } = useAnalysisSummary({
    analysisId,
    id: insight.relationships.insightable.data.id,
  });

  const { data: backgroundTask } = useAnalysisBackgroundTask(
    analysisId,
    summary?.data.relationships.background_task.data.id
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

  const deleteTrailingIncompleteIDs = (str: string | null) => {
    if (!str) return str;
    return str.replace(/\[?[0-9a-f-]{0,35}$/, '');
  };

  const replaceIdRefsWithLinks = (summary) => {
    return reactStringReplace(
      summary,
      /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g,
      (match, i) => (
        <StyledButton onClick={() => setSelectedInputId(match)} key={i}>
          <Icon name="idea" />
        </StyledButton>
      )
    );
  };

  if (!summary) return null;

  const hasFilters = !!Object.keys(summary.data.attributes.filters).length;
  const tagIds = summary.data.attributes.filters.tag_ids;

  const phaseId = searchParams.get('phase_id');

  const handleRestoreFilters = () => {
    setSearchParams({
      ...(phaseId
        ? {
            phase_id: phaseId,
          }
        : {}),
      reset_filters: 'true',
    });
    updateSearchParams(summary.data.attributes.filters);
  };

  const summaryText = summary.data.attributes.summary;

  return (
    <Box
      key={summary.data.id}
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
              <FilterItems
                filters={summary.data.attributes.filters}
                isEditable={false}
              />
              {tags?.data
                .filter((tag) => tagIds?.includes(tag.id))
                .map((tag) => (
                  <Tag
                    key={tag.id}
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                ))}
            </>
          )}

          {!hasFilters && (
            <>
              <Box>Summary for all inputs</Box>
            </>
          )}
        </Box>
        <Box>
          <StyledSummaryText>
            {replaceIdRefsWithLinks(
              processing
                ? deleteTrailingIncompleteIDs(summaryText)
                : summaryText
            )}
          </StyledSummaryText>
          {processing && <Spinner />}
        </Box>
        {summary.data.attributes.accuracy && (
          <Box color={colors.teal700} mt="16px">
            Accuracy {summary.data.attributes.accuracy * 100}%
          </Box>
        )}
      </Box>

      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          Restore filters
        </Button>
        <Box display="flex">
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="24px"
            iconColor={colors.teal400}
          />
          <IconButton
            iconName="delete"
            onClick={() => handleSummaryDelete(insight.id)}
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;
