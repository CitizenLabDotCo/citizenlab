import React from 'react';

import { Radio, IconTooltip, IOption } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IdeaSortMethod, InputTerm } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import FeatureFlag from 'components/FeatureFlag';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import { ReactingLimitInput } from '../../shared/styling';
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
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
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
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  ideas_order: IdeaSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
  prescreening_enabled: boolean | null | undefined;
  togglePrescreeningEnabled: (prescreening_enabled: boolean) => void;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
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
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
  prescreening_enabled,
  togglePrescreeningEnabled,
  similarity_enabled,
  similarity_threshold_title,
  similarity_threshold_body,
  handleSimilarityEnabledChange,
  handleThresholdChange,
}: Props) => {
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });

  return (
    <>
      <AnonymousPostingToggle
        allow_anonymous_participation={allow_anonymous_participation}
        handleAllowAnonymousParticipationOnChange={
          handleAllowAnonymousParticipationOnChange
        }
      />
      <CustomFieldPicker
        input_term={input_term}
        handleInputTermChange={handleInputTermChange}
      />
      {prescreeningIdeationEnabled && (
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

      {reacting_enabled && (
        <FeatureFlag name="disable_disliking">
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.dislikingPosts} />
              <IconTooltip
                content={
                  <FormattedMessage {...messages.disableDislikingTooltip} />
                }
              />
            </SubSectionTitle>
            <Radio
              onChange={handleReactingDislikeEnabledOnChange}
              currentValue={reacting_dislike_enabled}
              value={true}
              name="enableDisliking"
              id="enableDisliking-true"
              label={<FormattedMessage {...messages.dislikingEnabled} />}
            />
            <Radio
              onChange={handleReactingDislikeEnabledOnChange}
              currentValue={reacting_dislike_enabled}
              value={false}
              name="enableDisliking"
              id="enableDisliking-false"
              label={<FormattedMessage {...messages.dislikingDisabled} />}
            />
            <Error
              apiErrors={apiErrors && apiErrors.reacting_dislike_enabled}
            />
          </SectionField>
          {reacting_dislike_enabled && (
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.dislikingMethodTitle} />
              </SubSectionTitle>
              <Radio
                onChange={handleReactingDislikeMethodOnChange}
                currentValue={reacting_dislike_method}
                value="unlimited"
                name="dislikingmethod"
                id="dislikingmethod-unlimited"
                label={<FormattedMessage {...messages.unlimited} />}
              />
              <Radio
                onChange={handleReactingDislikeMethodOnChange}
                currentValue={reacting_dislike_method}
                value="limited"
                name="dislikingmethod"
                id="dislikingmethod-limited"
                label={<FormattedMessage {...messages.limited} />}
              />
              {reacting_dislike_method === 'limited' && (
                <>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.maxDislikes} />
                  </SubSectionTitle>
                  <ReactingLimitInput
                    id="disliking-limit"
                    type="number"
                    min="1"
                    placeholder=""
                    value={
                      reacting_dislike_limited_max
                        ? reacting_dislike_limited_max.toString()
                        : null
                    }
                    onChange={handleDislikingLimitOnChange}
                  />
                  <Error
                    text={noDislikingLimitError}
                    apiErrors={apiErrors && apiErrors.reacting_limit}
                  />
                </>
              )}
            </SectionField>
          )}
        </FeatureFlag>
      )}

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

export default IdeationInputs;
