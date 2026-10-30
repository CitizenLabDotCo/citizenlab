import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { supportsAnswerFilter } from 'api/custom_fields/util';
import { IIdeaQueryParameters } from 'api/ideas/types';
import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';
import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import messages from '../messages';
import AnswerFilterBox from '../shared/Filters/AnswerFilterBox';
import SortingBox from '../shared/Filters/SortingBox';
import StatusFilterBox from '../shared/Filters/StatusFilterBox';
import TopicFilterBox from '../shared/Filters/TopicFilterBox';

import ResetFiltersButton from './ResetFiltersButton';

export interface InputFiltersProps {
  defaultValue?: string;
  ideasFilterCounts: IIdeasFilterCounts | NilOrError;
  numberOfSearchResults: number;
  ideaQueryParameters: IIdeaQueryParameters;
  onSearch: (searchTerm: string) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
  onChangeAnswer: (fieldId: string, optionKey: string | null) => void;
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
  projectId?: string;
  showResetButton?: boolean;
  showStatusFilter?: boolean;
  showSearchField?: boolean;
}

const InputFilters = ({
  defaultValue,
  ideasFilterCounts,
  numberOfSearchResults,
  ideaQueryParameters,
  phaseId,
  projectId,
  showResetButton = true,
  showStatusFilter = true,
  showSearchField = true,
  onSearch,
  onChangeStatus,
  onChangeTopics,
  onChangeAnswer,
  handleSortOnChange,
}: InputFiltersProps) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const answerFiltersEnabled = useFeatureFlag({
    name: 'input_form_answer_filters',
  });
  // Without an id the fields are not fetched.
  const { data: customFields } = useCustomFields({
    phaseId: answerFiltersEnabled ? phaseId : undefined,
    publicFields: true,
  });
  const answerFilterFields = customFields?.filter(
    (field) => field.show_as_filter && supportsAnswerFilter(field.input_type)
  );
  const participationMethod =
    phase?.data.attributes.participation_method || 'ideation'; // Ideation used as fallback here for All Ideas page.
  const isProposalsOrIdeation =
    participationMethod === 'ideation' || participationMethod === 'proposals';
  const isVoting = participationMethod === 'voting';
  const counts = isNilOrError(ideasFilterCounts)
    ? undefined
    : ideasFilterCounts.data.attributes;

  return (
    <>
      <ScreenReaderOnly aria-live="polite">
        {counts && (
          <FormattedMessage
            {...messages.a11y_totalItems}
            values={{ ideasCount: counts.total }}
          />
        )}
      </ScreenReaderOnly>
      {showSearchField && (
        // mt is here to ensure search input's label still shows when it's lifted up.
        // Needs to be fixed in the SearchInput component.
        <Box mt="8px" mb="20px">
          <SearchInput
            defaultValue={defaultValue}
            onChange={onSearch}
            debounce={1500}
            a11y_numberOfSearchResults={numberOfSearchResults}
            placeholder={formatMessage(messages.searchPosts)}
          />
        </Box>
      )}
      {!isVoting && (
        <Box mb="20px">
          <SortingBox
            handleSortOnChange={handleSortOnChange}
            phaseId={phaseId}
          />
        </Box>
      )}
      {projectId && (
        <Box mb="20px">
          <TopicFilterBox
            projectId={projectId}
            selectedTopicIds={ideaQueryParameters.input_topics}
            filterCounts={counts}
            onChange={onChangeTopics}
          />
        </Box>
      )}
      {answerFilterFields?.map((field) => (
        <Box key={field.id} mb="20px" data-cy="e2e-answer-filter-box">
          <AnswerFilterBox
            field={field}
            optionCounts={counts?.custom_field_answers?.[field.id]}
            totalCount={counts?.total}
            selectedOptionKey={
              ideaQueryParameters.custom_field_answers?.[field.id]?.[0]
            }
            onChange={(optionKey) => onChangeAnswer(field.id, optionKey)}
          />
        </Box>
      ))}
      {showStatusFilter && isProposalsOrIdeation && (
        <StatusFilterBox
          participationMethod={participationMethod}
          selectedStatusId={ideaQueryParameters.idea_status}
          statusCounts={counts?.idea_status_id}
          totalCount={counts?.total}
          onChange={onChangeStatus}
          phase={phase}
        />
      )}
      {showResetButton && (
        <Box mt="8px">
          <ResetFiltersButton ideaQueryParameters={ideaQueryParameters} />
        </Box>
      )}
    </>
  );
};

export default InputFilters;
