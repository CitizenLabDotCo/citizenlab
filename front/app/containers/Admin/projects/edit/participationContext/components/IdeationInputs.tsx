import React from 'react';

// components
import { Radio, IconTooltip, Toggle, IOption } from 'cl2-component-library';
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
  posting_enabled: boolean | null | undefined;
  commenting_enabled: boolean | null | undefined;
  voting_enabled: boolean | null | undefined;
  voting_method: 'unlimited' | 'limited' | null | undefined;
  upvoting_limited_max: number | null | undefined;
  noUpvotingLimit: JSX.Element | null;
  downvoting_enabled: boolean | null | undefined;
  downvoting_limited_max: number | null | undefined;
  noDownvotingLimit: JSX.Element | null;
  apiErrors: ApiErrors;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleVotingEnabled: () => void;
  handeVotingMethodOnChange: (voting_method: 'unlimited' | 'limited') => void;
  handleUpvotingLimitOnChange: (upvoting_limited_max: string) => void;
  handleDownvotingLimitOnChange: (downvoting_limited_max: string) => void;
  handleDownvotingEnabledOnChange: (downvoting_enabled: boolean) => void;
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
  voting_method,
  upvoting_limited_max,
  downvoting_limited_max,
  downvoting_enabled,
  noUpvotingLimit,
  noDownvotingLimit,
  apiErrors,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleVotingEnabled,
  handeVotingMethodOnChange,
  handleUpvotingLimitOnChange,
  handleDownvotingLimitOnChange,
  handleDownvotingEnabledOnChange,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
}: Props) => (
  <>
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
        <Toggle
          checked={posting_enabled as boolean}
          onChange={togglePostingEnabled}
        />
        <Error apiErrors={apiErrors && apiErrors.posting_enabled} />
      </ToggleRow>

      <ToggleRow>
        <ToggleLabel>
          <FormattedMessage {...messages.inputCommentingEnabled} />
        </ToggleLabel>
        <Toggle
          checked={commenting_enabled as boolean}
          onChange={toggleCommentingEnabled}
        />
        <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
      </ToggleRow>

      <ToggleRow className="last">
        <ToggleLabel>
          <FormattedMessage {...messages.inputVotingEnabled} />
        </ToggleLabel>
        <Toggle
          checked={voting_enabled as boolean}
          onChange={toggleVotingEnabled}
        />
        <Error apiErrors={apiErrors && apiErrors.voting_enabled} />
      </ToggleRow>
    </StyledSectionField>
    {voting_enabled && (
      <>
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.votingMethod} />
            <IconTooltip
              content={<FormattedMessage {...messages.votingMaximumTooltip} />}
            />
          </SubSectionTitle>
          <Radio
            onChange={handeVotingMethodOnChange}
            currentValue={voting_method}
            value="unlimited"
            name="votingmethod"
            id="votingmethod-unlimited"
            label={<FormattedMessage {...messages.unlimited} />}
          />
          <Radio
            onChange={handeVotingMethodOnChange}
            currentValue={voting_method}
            value="limited"
            name="votingmethod"
            id="votingmethod-limited"
            label={<FormattedMessage {...messages.limited} />}
          />
          <Error apiErrors={apiErrors && apiErrors.voting_method} />

          {voting_method === 'limited' && (
            <>
              <SubSectionTitle>
                <FormattedMessage {...messages.upvotingLimit} />
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
                text={noUpvotingLimit}
                apiErrors={apiErrors && apiErrors.voting_limit}
              />
              <SubSectionTitle>
                <FormattedMessage {...messages.downvotingLimit} />
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
                text={noDownvotingLimit}
                apiErrors={apiErrors && apiErrors.voting_limit}
              />
            </>
          )}
        </SectionField>

        <FeatureFlag name="disable_downvoting">
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.downvoting} />
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
        </FeatureFlag>

        <DefaultViewPicker
          presentation_mode={presentation_mode}
          apiErrors={apiErrors}
          handleIdeasDisplayChange={handleIdeasDisplayChange}
        />

        <SortingPicker
          ideas_order={ideas_order}
          apiErrors={apiErrors}
          handleIdeaDefaultSortMethodChange={handleIdeaDefaultSortMethodChange}
        />
      </>
    )}
  </>
);
