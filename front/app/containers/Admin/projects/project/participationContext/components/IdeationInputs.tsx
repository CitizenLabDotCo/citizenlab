import React from 'react';

// components
import {
  Radio,
  IconTooltip,
  Toggle,
  IOption,
  Text,
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
  VotingLimitInput,
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

interface Props {
  isCustomInputTermEnabled: boolean;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  inputTermOptions: IOption[];
  posting_enabled: boolean;
  commenting_enabled: boolean;
  voting_enabled: boolean;
  upvoting_method: 'unlimited' | 'limited' | null | undefined;
  upvoting_limited_max: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  noUpvotingLimitError: JSX.Element | null;
  downvoting_enabled: boolean | null | undefined;
  downvoting_method: 'unlimited' | 'limited' | null | undefined;
  downvoting_limited_max: number | null | undefined;
  noDownvotingLimitError: JSX.Element | null;
  apiErrors: ApiErrors;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleVotingEnabled: () => void;
  handleUpvotingMethodOnChange: (
    upvoting_method: 'unlimited' | 'limited'
  ) => void;
  handleDownvotingMethodOnChange: (
    downvoting_method: 'unlimited' | 'limited'
  ) => void;
  handleUpvotingLimitOnChange: (upvoting_limited_max: string) => void;
  handleDownvotingLimitOnChange: (downvoting_limited_max: string) => void;
  handleDownvotingEnabledOnChange: (downvoting_enabled: boolean) => void;
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
  voting_enabled,
  upvoting_method,
  downvoting_method,
  allow_anonymous_participation,
  upvoting_limited_max,
  downvoting_limited_max,
  downvoting_enabled,
  noUpvotingLimitError,
  noDownvotingLimitError,
  apiErrors,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleVotingEnabled,
  handleUpvotingMethodOnChange,
  handleDownvotingMethodOnChange,
  handleUpvotingLimitOnChange,
  handleDownvotingLimitOnChange,
  handleDownvotingEnabledOnChange,
  handleAllowAnonymousParticipationOnChange,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
}: Props) => (
  <>
    <StyledSectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.userPrivacy} />
      </SubSectionTitle>
      <Toggle
        checked={allow_anonymous_participation || false}
        onChange={() => {
          handleAllowAnonymousParticipationOnChange(
            !allow_anonymous_participation
          );
        }}
        label={
          <>
            <Text color="primary" mb="0px" fontSize="m" fontWeight="bold">
              <FormattedMessage {...messages.userPrivacyLabelText} />
            </Text>
            <Text color="primary" mt="0px" fontSize="s">
              <FormattedMessage {...messages.userPrivacyLabelSubtext} />
            </Text>
          </>
        }
      />
    </StyledSectionField>
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
        <Toggle checked={voting_enabled} onChange={toggleVotingEnabled} />
        <Error apiErrors={apiErrors && apiErrors.voting_enabled} />
      </ToggleRow>
    </StyledSectionField>
    {voting_enabled && (
      <>
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.upvotingMethodTitle} />
          </SubSectionTitle>
          <Radio
            onChange={handleUpvotingMethodOnChange}
            currentValue={upvoting_method}
            value="unlimited"
            name="upvotingmethod"
            id="upvotingmethod-unlimited"
            label={<FormattedMessage {...messages.unlimited} />}
          />
          <Radio
            onChange={handleUpvotingMethodOnChange}
            currentValue={upvoting_method}
            value="limited"
            name="upvotingmethod"
            id="upvotingmethod-limited"
            label={<FormattedMessage {...messages.limited} />}
          />
          <Error apiErrors={apiErrors && apiErrors.voting_method} />

          {upvoting_method === 'limited' && (
            <>
              <SubSectionTitle>
                <FormattedMessage {...messages.maxUpvotes} />
              </SubSectionTitle>
              <VotingLimitInput
                id="upvoting-limit"
                type="number"
                min="1"
                placeholder=""
                value={
                  upvoting_limited_max ? upvoting_limited_max.toString() : null
                }
                onChange={handleUpvotingLimitOnChange}
              />
              <Error
                text={noUpvotingLimitError}
                apiErrors={apiErrors && apiErrors.voting_limit}
              />
            </>
          )}
        </SectionField>
        <FeatureFlag name="disable_downvoting">
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
              onChange={handleDownvotingEnabledOnChange}
              currentValue={downvoting_enabled}
              value={true}
              name="enableDownvoting"
              id="enableDownvoting-true"
              label={<FormattedMessage {...messages.downvotingEnabled} />}
            />
            <Radio
              onChange={handleDownvotingEnabledOnChange}
              currentValue={downvoting_enabled}
              value={false}
              name="enableDownvoting"
              id="enableDownvoting-false"
              label={<FormattedMessage {...messages.downvotingDisabled} />}
            />
            <Error apiErrors={apiErrors && apiErrors.downvoting_enabled} />
          </SectionField>
          {downvoting_enabled && (
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.downvotingMethodTitle} />
              </SubSectionTitle>
              <Radio
                onChange={handleDownvotingMethodOnChange}
                currentValue={downvoting_method}
                value="unlimited"
                name="downvotingmethod"
                id="downvotingmethod-unlimited"
                label={<FormattedMessage {...messages.unlimited} />}
              />
              <Radio
                onChange={handleDownvotingMethodOnChange}
                currentValue={downvoting_method}
                value="limited"
                name="downvotingmethod"
                id="downvotingmethod-limited"
                label={<FormattedMessage {...messages.limited} />}
              />
              {downvoting_method === 'limited' && (
                <>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.maxDownvotes} />
                  </SubSectionTitle>
                  <VotingLimitInput
                    id="downvoting-limit"
                    type="number"
                    min="1"
                    placeholder=""
                    value={
                      downvoting_limited_max
                        ? downvoting_limited_max.toString()
                        : null
                    }
                    onChange={handleDownvotingLimitOnChange}
                  />
                  <Error
                    text={noDownvotingLimitError}
                    apiErrors={apiErrors && apiErrors.voting_limit}
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
