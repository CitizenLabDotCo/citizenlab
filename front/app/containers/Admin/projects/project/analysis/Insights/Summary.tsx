import React, { useState } from 'react';
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
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import translations from './translations';
import styled from 'styled-components';
import { useSelectedInputContext } from '../SelectedInputContext';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import FilterItems from '../FilterItems';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Rate from './Rate';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

import { deleteTrailingIncompleteIDs, refRegex, removeRefs } from './util';

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
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage, formatDate } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteSummary } = useDeleteAnalysisInsight();

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
    if (window.confirm(formatMessage(translations.deleteSummaryConfirmation))) {
      deleteSummary(
        {
          analysisId,
          id,
        },
        {
          onSuccess: () => {
            trackEventByName(tracks.summaryDeleted.name, {
              extra: { analysisId },
            });
          },
        }
      );
    }
  };

  const handleClickInput = (inputId: string) => {
    setSelectedInputId(inputId);
    const element = document.getElementById(`input-${inputId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const replaceIdRefsWithLinks = (summary) => {
    return reactStringReplace(summary, refRegex, (match, i) => (
      <StyledButton
        onClick={() => {
          handleClickInput(match);
          trackEventByName(tracks.inputPreviewedFromSummary.name, {
            extra: { analysisId },
          });
        }}
        key={i}
      >
        <Icon name="idea" />
      </StyledButton>
    ));
  };

  if (!summary) return null;

  const hasFilters = !!Object.keys(summary.data.attributes.filters).length;

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
    const filters = summary.data.attributes.filters;
    updateSearchParams(filters);
    if (filters.tag_ids?.length === 1) {
      const element = document.getElementById(`tag-${filters.tag_ids[0]}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const summaryText = summary.data.attributes.summary;

  return (
    <Box
      key={summary.data.id}
      bgColor={colors.teal100}
      p="24px"
      pt="48px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
      position="relative"
    >
      <Box position="absolute" top="16px" right="8px">
        <IconButton
          iconName={isCopied ? 'check' : 'copy'}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={'Copy summary to clipboard'}
          onClick={() => {
            summaryText &&
              navigator.clipboard.writeText(removeRefs(summaryText));
            setIsCopied(true);
          }}
        />
      </Box>
      <Box>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="4px"
          mb="12px"
        >
          {hasFilters && (
            <>
              <Text m="0px">{formatMessage(translations.summaryFor)}</Text>
              <FilterItems
                filters={summary.data.attributes.filters}
                isEditable={false}
              />
            </>
          )}

          {!hasFilters && (
            <>
              <Text m="0px">
                {formatMessage(translations.summaryForAllInputs)}
              </Text>
            </>
          )}
        </Box>

        <Text color="textSecondary" fontSize="s">
          {formatDate(summary.data.attributes.created_at)}
        </Text>
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
          <Box color={colors.teal700} my="16px">
            <FormattedMessage
              {...translations.accuracy}
              values={{
                accuracy: summary.data.attributes.accuracy * 100,
                percentage: formatMessage(translations.percentage),
              }}
            />
          </Box>
        )}
      </Box>

      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
        mt="16px"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          {formatMessage(translations.restoreFilters)}
        </Button>
        <Box display="flex">
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="24px"
            iconColor={colors.teal400}
            placement="left-end"
          />
          <IconButton
            iconName="bookmark"
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(translations.deleteSummary)}
            onClick={() => {}}
          />

          <IconButton
            iconName="delete"
            onClick={() => handleSummaryDelete(insight.id)}
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(translations.deleteSummary)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;
