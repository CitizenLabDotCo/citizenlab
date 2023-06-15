import React from 'react';

// components
import {
  Radio,
  IconTooltip,
  Toggle,
  IOption,
} from '@citizenlab/cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import CustomFieldPicker from './CustomFieldPicker';
import DefaultViewPicker from './DefaultViewPicker';
import SortingPicker from './SortingPicker';
import {
  StyledSectionField,
  ToggleRow,
  ToggleLabel,
  ReactingLimitInput,
} from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import { ApiErrors } from '..';
import {
  IdeaDefaultSortMethod,
  InputTerm,
} from 'services/participationContexts';
import { AnonymousPostingToggle } from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

interface Props {
  isCustomInputTermEnabled: boolean;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  inputTermOptions: IOption[];
  posting_enabled: boolean;
  commenting_enabled: boolean;
  reacting_enabled: boolean;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  noLikingLimitError: JSX.Element | null;
  reacting_dislike_enabled: boolean | null | undefined;
  reacting_dislike_method: 'unlimited' | 'limited' | null | undefined;
  reacting_dislike_limited_max: number | null | undefined;
  noDislikingLimitError: JSX.Element | null;
  apiErrors: ApiErrors;
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
  ideas_order: IdeaDefaultSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (
    ideas_order: IdeaDefaultSortMethod
  ) => void;
}

export default ({
  isCustomInputTermEnabled,
  input_term,
  handleInputTermChange,
  inputTermOptions,
  posting_enabled,
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
}: Props) => {
  const hasAnonymousParticipationEnabled = useFeatureFlag({
    name: 'anonymous_participation',
  });
  return (
    <>
      {hasAnonymousParticipationEnabled && (
        <AnonymousPostingToggle
          allow_anonymous_participation={allow_anonymous_participation}
          handleAllowAnonymousParticipationOnChange={
            handleAllowAnonymousParticipationOnChange
          }
        />
      )}

      {isCustomInputTermEnabled && (
        <CustomFieldPicker
          input_term={input_term}
          handleInputTermChange={handleInputTermChange}
          inputTermOptions={inputTermOptions}
        />
      )}
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.phasePermissions} />
          <IconTooltip
            content={<FormattedMessage {...messages.phasePermissionsTooltip} />}
          />
        </SubSectionTitle>

        <ToggleRow>
          <ToggleLabel>
            <FormattedMessage {...messages.inputPostingEnabled} />
          </ToggleLabel>
          <Toggle checked={posting_enabled} onChange={togglePostingEnabled} />
          <Error apiErrors={apiErrors && apiErrors.posting_enabled} />
        </ToggleRow>

        <ToggleRow>
          <ToggleLabel>
            <FormattedMessage {...messages.inputCommentingEnabled} />
          </ToggleLabel>
          <Toggle
            checked={commenting_enabled}
            onChange={toggleCommentingEnabled}
          />
          <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
        </ToggleRow>

        <ToggleRow className="last">
          <ToggleLabel>
            <FormattedMessage {...messages.inputVotingEnabled} />
          </ToggleLabel>
          <Toggle checked={reacting_enabled} onChange={toggleReactingEnabled} />
          <Error apiErrors={apiErrors && apiErrors.reacting_enabled} />
        </ToggleRow>
      </StyledSectionField>
      {reacting_enabled && (
        <>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.upvotingMethodTitle} />
            </SubSectionTitle>
            <Radio
              onChange={handleReactingLikeMethodOnChange}
              currentValue={reacting_like_method}
              value="unlimited"
              name="likingmethod"
              id="likingmethod-unlimited"
              label={<FormattedMessage {...messages.unlimited} />}
            />
            <Radio
              onChange={handleReactingLikeMethodOnChange}
              currentValue={reacting_like_method}
              value="limited"
              name="likingmethod"
              id="likingmethod-limited"
              label={<FormattedMessage {...messages.limited} />}
            />
            <Error apiErrors={apiErrors && apiErrors.reacting_method} />

            {reacting_like_method === 'limited' && (
              <>
                <SubSectionTitle>
                  <FormattedMessage {...messages.maxUpvotes} />
                </SubSectionTitle>
                <ReactingLimitInput
                  id="liking-limit"
                  type="number"
                  min="1"
                  placeholder=""
                  value={
                    reacting_like_limited_max
                      ? reacting_like_limited_max.toString()
                      : null
                  }
                  onChange={handleLikingLimitOnChange}
                />
                <Error
                  text={noLikingLimitError}
                  apiErrors={apiErrors && apiErrors.reacting_limit}
                />
              </>
            )}
          </SectionField>
          <FeatureFlag name="disable_disliking">
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.downvotingPosts} />
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.disableDownvotingTooltip} />
                  }
                />
              </SubSectionTitle>
              <Radio
                onChange={handleReactingDislikeEnabledOnChange}
                currentValue={reacting_dislike_enabled}
                value={true}
                name="enableDisliking"
                id="enableDisliking-true"
                label={<FormattedMessage {...messages.downvotingEnabled} />}
              />
              <Radio
                onChange={handleReactingDislikeEnabledOnChange}
                currentValue={reacting_dislike_enabled}
                value={false}
                name="enableDisliking"
                id="enableDisliking-false"
                label={<FormattedMessage {...messages.downvotingDisabled} />}
              />
              <Error
                apiErrors={apiErrors && apiErrors.reacting_dislike_enabled}
              />
            </SectionField>
            {reacting_dislike_enabled && (
              <SectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.downvotingMethodTitle} />
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
                      <FormattedMessage {...messages.maxDownvotes} />
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
        </>
      )}

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />

      <SortingPicker
        options={[
          { key: 'trending', value: 'trending' },
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
