import React from 'react';

import { Input, IOption } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IdeaSortMethod, InputTerm } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import PrescreeningToggle from '../_shared/PrescreeningToggle';
import SortingPicker from '../_shared/SortingPicker';
import UserActions from '../_shared/UserActions';

interface Props {
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  noLikingLimitError?: string;
  expire_days_limit: number | null | undefined;
  expireDateLimitError?: string;
  reacting_threshold: number | null | undefined;
  reactingThresholdError?: string;
  apiErrors: CLErrors | null | undefined;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleReactingEnabled: () => void;
  handleReactingLikeMethodOnChange: (
    reacting_like_method: 'unlimited' | 'limited'
  ) => void;
  handleLikingLimitOnChange: (reacting_like_limited_max: string) => void;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  ideas_order: IdeaSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
  handleDaysLimitChange: (limit: string) => void;
  handleReactingThresholdChange: (threshold: string) => void;
  prescreening_enabled: boolean | null | undefined;
  togglePrescreeningEnabled: (prescreening_enabled: boolean) => void;
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
}

const ProposalsInputs = ({
  input_term,
  handleInputTermChange,
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
  reacting_like_method,
  allow_anonymous_participation,
  reacting_like_limited_max,
  noLikingLimitError,
  expire_days_limit,
  expireDateLimitError,
  reacting_threshold,
  reactingThresholdError,
  apiErrors,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleReactingEnabled,
  handleReactingLikeMethodOnChange,
  handleLikingLimitOnChange,
  handleAllowAnonymousParticipationOnChange,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
  handleDaysLimitChange,
  handleReactingThresholdChange,
  prescreening_enabled,
  togglePrescreeningEnabled,
  similarity_enabled,
  similarity_threshold_title,
  similarity_threshold_body,
  handleSimilarityEnabledChange,
  handleThresholdChange,
}: Props) => {
  const prescreeningFeatureEnabled = useFeatureFlag({
    name: 'prescreening',
  });

  return (
    <>
      <CustomFieldPicker
        input_term={input_term}
        handleInputTermChange={handleInputTermChange}
      />
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.expireDaysLimit} />
        </SubSectionTitle>
        <Input
          id="expire_days_limit"
          type="number"
          min="1"
          placeholder=""
          value={expire_days_limit ? expire_days_limit.toString() : null}
          onChange={handleDaysLimitChange}
        />
        <Error
          text={expireDateLimitError}
          apiErrors={apiErrors && apiErrors.expire_days_limit}
        />
      </SectionField>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.reactingThreshold} />
        </SubSectionTitle>
        <Input
          id="reacting_threshold"
          type="number"
          min="2"
          placeholder=""
          value={reacting_threshold ? reacting_threshold.toString() : null}
          onChange={handleReactingThresholdChange}
        />
        <Error
          text={reactingThresholdError}
          apiErrors={apiErrors && apiErrors.reacting_threshold}
        />
      </SectionField>
      <AnonymousPostingToggle
        allow_anonymous_participation={allow_anonymous_participation}
        handleAllowAnonymousParticipationOnChange={
          handleAllowAnonymousParticipationOnChange
        }
      />
      {prescreeningFeatureEnabled && (
        <PrescreeningToggle
          prescreening_enabled={prescreening_enabled}
          togglePrescreeningEnabled={togglePrescreeningEnabled}
        />
      )}
      <UserActions
        submission_enabled={submission_enabled || false}
        commenting_enabled={commenting_enabled || false}
        reacting_enabled={reacting_enabled || false}
        togglePostingEnabled={togglePostingEnabled}
        toggleCommentingEnabled={toggleCommentingEnabled}
        toggleReactingEnabled={toggleReactingEnabled}
        apiErrors={apiErrors}
        reacting_like_method={reacting_like_method}
        reacting_like_limited_max={reacting_like_limited_max}
        noLikingLimitError={noLikingLimitError}
        handleReactingLikeMethodOnChange={handleReactingLikeMethodOnChange}
        handleLikingLimitOnChange={handleLikingLimitOnChange}
      />

      <SimilarityDetectionConfig
        apiErrors={apiErrors}
        similarity_enabled={similarity_enabled}
        similarity_threshold_title={similarity_threshold_title}
        similarity_threshold_body={similarity_threshold_body}
        handleSimilarityEnabledChange={handleSimilarityEnabledChange}
        handleThresholdChange={handleThresholdChange}
      />

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />

      <SortingPicker
        options={[
          { key: 'trending', value: 'trending' },
          { key: 'comments_count', value: 'comments_count' },
          { key: 'random', value: 'random' },
          { key: 'popular', value: 'popular' },
          { key: 'newest', value: 'new' },
          { key: 'oldest', value: '-new' },
        ]}
        ideas_order={ideas_order}
        apiErrors={apiErrors}
        handleIdeaDefaultSortMethodChange={handleIdeaDefaultSortMethodChange}
      />
    </>
  );
};

export default ProposalsInputs;
