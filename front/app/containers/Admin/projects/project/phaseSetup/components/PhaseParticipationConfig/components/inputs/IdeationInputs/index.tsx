import React from 'react';

import { IOption } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  IdeaSortMethod,
  InputTerm,
  PresentationMode,
  PrescreeningMode,
} from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle';

import { useIntl } from 'utils/cl-intl';

import configMessages from '../../../messages';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import PanelGroup from '../../shared/PanelGroup';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import ViewSelector from '../../shared/ViewSelector';
import PrescreeningModeSelector from '../_shared/PrescreeningModeSelector';
import SortingPicker from '../_shared/SortingPicker';
import UserActions from '../_shared/UserActions';

import DislikingSettings from './DislikingSettings';

interface Props {
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  toggleAnonymousPostingDisabledReason?: string;
  noLikingLimitError?: string;
  reacting_dislike_enabled: boolean | null | undefined;
  reacting_dislike_method: 'unlimited' | 'limited' | null | undefined;
  reacting_dislike_limited_max: number | null | undefined;
  noDislikingLimitError?: string;
  apiErrors: CLErrors | null | undefined;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleReactingEnabled: () => void;
  handleReactingLikeMethodOnChange: (
    reacting_like_method: 'unlimited' | 'limited'
  ) => void;
  handleReactingDislikeMethodOnChange: (
    reacting_dislike_method: 'unlimited' | 'limited'
  ) => void;
  handleLikingLimitOnChange: (reacting_like_limited_max: string) => void;
  handleDislikingLimitOnChange: (reacting_dislike_limited_max: string) => void;
  handleReactingDislikeEnabledOnChange: (
    reacting_dislike_enabled: boolean
  ) => void;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  presentation_mode: PresentationMode | null | undefined;
  available_views: PresentationMode[] | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: PresentationMode) => void;
  handleAvailableViewsChange: (
    available_views: PresentationMode[],
    presentation_mode?: PresentationMode
  ) => void;
  ideas_order: IdeaSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
  prescreening_mode: PrescreeningMode | null | undefined;
  onPrescreeningModeChange: (mode: PrescreeningMode | null) => void;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
  /** 'panel' groups the settings by concern for the narrow workspace panel. */
  layout?: 'page' | 'panel';
}

const IdeationInputs = ({
  input_term,
  handleInputTermChange,
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
  reacting_like_method,
  reacting_dislike_method,
  allow_anonymous_participation,
  toggleAnonymousPostingDisabledReason,
  reacting_like_limited_max,
  reacting_dislike_limited_max,
  reacting_dislike_enabled,
  noLikingLimitError,
  noDislikingLimitError,
  apiErrors,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleReactingEnabled,
  handleReactingLikeMethodOnChange,
  handleReactingDislikeMethodOnChange,
  handleLikingLimitOnChange,
  handleDislikingLimitOnChange,
  handleReactingDislikeEnabledOnChange,
  handleAllowAnonymousParticipationOnChange,
  presentation_mode,
  available_views,
  handleIdeasDisplayChange,
  handleAvailableViewsChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
  prescreening_mode,
  onPrescreeningModeChange,
  similarity_enabled,
  similarity_threshold_title,
  similarity_threshold_body,
  handleSimilarityEnabledChange,
  handleThresholdChange,
  layout = 'page',
}: Props) => {
  const { formatMessage } = useIntl();
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });

  const anonymity = (
    <AnonymousPostingToggle
      allow_anonymous_participation={allow_anonymous_participation}
      handleAllowAnonymousParticipationOnChange={
        handleAllowAnonymousParticipationOnChange
      }
      disabledReason={toggleAnonymousPostingDisabledReason}
    />
  );

  const inputTerm = (
    <CustomFieldPicker
      input_term={input_term}
      handleInputTermChange={handleInputTermChange}
    />
  );

  const screening = prescreeningIdeationEnabled ? (
    <PrescreeningModeSelector
      prescreening_mode={prescreening_mode}
      onPrescreeningModeChange={onPrescreeningModeChange}
    />
  ) : null;

  const userActions = (
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
  );

  const disliking = (
    <DislikingSettings
      reacting_enabled={reacting_enabled}
      reacting_dislike_enabled={reacting_dislike_enabled}
      reacting_dislike_method={reacting_dislike_method}
      reacting_dislike_limited_max={reacting_dislike_limited_max}
      noDislikingLimitError={noDislikingLimitError}
      apiErrors={apiErrors}
      handleReactingDislikeEnabledOnChange={
        handleReactingDislikeEnabledOnChange
      }
      handleReactingDislikeMethodOnChange={handleReactingDislikeMethodOnChange}
      handleDislikingLimitOnChange={handleDislikingLimitOnChange}
    />
  );

  const similarity = (
    <SimilarityDetectionConfig
      apiErrors={apiErrors}
      similarity_enabled={similarity_enabled}
      similarity_threshold_title={similarity_threshold_title}
      similarity_threshold_body={similarity_threshold_body}
      handleSimilarityEnabledChange={handleSimilarityEnabledChange}
      handleThresholdChange={handleThresholdChange}
    />
  );

  const views = (
    <ViewSelector
      presentation_mode={presentation_mode}
      available_views={available_views}
      apiErrors={apiErrors}
      handleIdeasDisplayChange={handleIdeasDisplayChange}
      handleAvailableViewsChange={handleAvailableViewsChange}
    />
  );

  const sorting = (
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
  );

  if (layout === 'panel') {
    return (
      <>
        {inputTerm}
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          defaultOpen
        >
          {userActions}
          {disliking}
        </PanelGroup>
        <PanelGroup label={formatMessage(configMessages.moderationGroup)}>
          {anonymity}
          {screening}
          {similarity}
        </PanelGroup>
        <PanelGroup label={formatMessage(configMessages.displayGroup)}>
          {views}
          {sorting}
        </PanelGroup>
      </>
    );
  }

  return (
    <>
      {anonymity}
      {inputTerm}
      {screening}
      {userActions}
      {disliking}
      {similarity}
      {views}
      {sorting}
    </>
  );
};

export default IdeationInputs;
