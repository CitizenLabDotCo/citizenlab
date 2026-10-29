import React from 'react';

import { Box, IOption } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  IdeaSortMethod,
  InputTerm,
  PresentationMode,
  PrescreeningMode,
} from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
import projectMessages from 'containers/Admin/projects/project/messages';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import configMessages from '../../../messages';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import ViewSelector from '../../shared/ViewSelector';
import ModerationAssignee from '../_shared/ModerationAssignee';
import PrescreeningModeSelector from '../_shared/PrescreeningModeSelector';
import ReactionLimitSettings from '../_shared/ReactionLimitSettings';
import SortingPicker from '../_shared/SortingPicker';
import UserActions from '../_shared/UserActions';

import DislikingSettings from './DislikingSettings';
import DislikingToggle from './DislikingToggle';

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
  layout?: 'page' | 'panel';
  phaseId?: string;
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
  phaseId,
}: Props) => {
  const { formatMessage } = useIntl();
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });

  const anonymity = (
    <AnonymousPostingToggle
      variant={layout === 'panel' ? 'panel' : undefined}
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
      variant={layout === 'panel' ? 'panel' : undefined}
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
      phaseId={phaseId}
      layout={layout}
    />
  );

  const likes = reacting_enabled && (
    <ReactionLimitSettings
      name="likingmethod"
      title={formatMessage(projectMessages.likingMethodTitle)}
      method={reacting_like_method}
      max={reacting_like_limited_max}
      maxLabel={formatMessage(projectMessages.maxLikes)}
      onMethodChange={handleReactingLikeMethodOnChange}
      onMaxChange={handleLikingLimitOnChange}
      error={
        <>
          <Error apiErrors={apiErrors && apiErrors.reacting_method} />
          <Error
            text={noLikingLimitError}
            apiErrors={apiErrors && apiErrors.reacting_limit}
          />
        </>
      }
    />
  );

  const dislikingToggle = (
    <DislikingToggle
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
      variant={layout === 'panel' ? 'panel' : undefined}
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
      variant={layout === 'panel' ? 'panel' : undefined}
      presentation_mode={presentation_mode}
      available_views={available_views}
      apiErrors={apiErrors}
      handleIdeasDisplayChange={handleIdeasDisplayChange}
      handleAvailableViewsChange={handleAvailableViewsChange}
    />
  );

  const sorting = (
    <SortingPicker
      variant={layout === 'panel' ? 'panel' : undefined}
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
        <Box mb="10px">
          <PanelHeading
            label={formatMessage(configMessages.howIdeasAreShown)}
          />
        </Box>
        {views}
        {sorting}
        <Box mb="10px">
          <PanelHeading label={formatMessage(configMessages.rulesGroup)} />
        </Box>
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          defaultOpen
        >
          {userActions}
          {dislikingToggle}
          {likes}
        </PanelGroup>
        <PanelGroup
          label={formatMessage(configMessages.moderationGroup)}
          defaultOpen
        >
          <Box display="flex" flexDirection="column" gap="16px">
            <ModerationAssignee phaseId={phaseId} />
            {screening}
            {anonymity}
            {similarity}
          </Box>
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
