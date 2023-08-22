import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  Button,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import { useSelectedInputContext } from '../SelectedInputContext';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import Tag from '../Tags/Tag';
import FilterItems from '../FilterItems';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

const StyledSummaryText = styled.div`
  white-space: pre-wrap;
`;

const StyledButton = styled.button`
  padding: 0px;
  cursor: pointer;
`;

type Props = {
  summary: ISummary['data'];
};

const Summary = ({ summary }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteSummary } = useDeleteAnalysisSummary();
  const { data: tags } = useAnalysisTags({ analysisId });

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
      (match, i) => (
        <StyledButton onClick={() => setSelectedInputId(match)} key={i}>
          <Icon name="search" />
        </StyledButton>
      )
    );
  };

  const hasFilters = !!Object.keys(summary.attributes.filters).length;
  const tagIds = summary.attributes.filters.tag_ids;

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
    updateSearchParams(summary.attributes.filters);
  };

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
              <Box>Summary for:</Box>
              <FilterItems filters={summary.attributes.filters} />
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
              <Box>Summary for all input</Box>
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
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          Restore filters
        </Button>
        {summary.attributes.accuracy && (
          <Box color={colors.teal700}>
            Accuracy {summary.attributes.accuracy * 100}%
          </Box>
        )}
        <IconButton
          iconName="delete"
          onClick={() => handleSummaryDelete(summary.id)}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
        />
      </Box>
    </Box>
  );
};

export default Summary;
