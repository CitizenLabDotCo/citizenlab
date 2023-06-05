import React from 'react';

// components
import {
  Toggle,
  IconTooltip,
  IOption,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import DefaultViewPicker from './DefaultViewPicker';
import SortingPicker from './SortingPicker';
import { ToggleRow, ToggleLabel } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import {
  IdeaDefaultSortMethod,
  InputTerm,
} from 'services/participationContexts';
import { ApiErrors } from '..';
import { AnonymousPostingToggle } from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import {
  VotingMethodType,
  getVotingMethodConfig,
} from 'containers/Admin/projects/project/participationContext/utils/votingMethodUtils';

// api
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import VotingMethodSelector from './voting/VotingMethodSelector';

export interface VotingInputsProps {
  isCustomInputTermEnabled: boolean;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  inputTermOptions: IOption[];
  allow_anonymous_participation: boolean | null | undefined;
  voting_method: VotingMethodType | null | undefined;
  min_budget: number | null | undefined;
  max_budget: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  handleMinBudgetingAmountChange: (newMinBudget: string) => void;
  handleMaxBudgetingAmountChange: (newMaxBudget: string) => void;
  toggleCommentingEnabled: () => void;
  apiErrors: ApiErrors;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  ideas_order: IdeaDefaultSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (
    ideas_order: IdeaDefaultSortMethod
  ) => void;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  handleVotingMethodOnChange: (voting_method: VotingMethodType) => void;
}

export default ({
  isCustomInputTermEnabled,
  input_term,
  handleInputTermChange,
  inputTermOptions,
  allow_anonymous_participation,
  voting_method,
  min_budget,
  max_budget,
  commenting_enabled,
  minBudgetError,
  maxBudgetError,
  handleMinBudgetingAmountChange,
  handleMaxBudgetingAmountChange,
  toggleCommentingEnabled,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
  handleAllowAnonymousParticipationOnChange,
  handleVotingMethodOnChange,
}: VotingInputsProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const props = {
    isCustomInputTermEnabled,
    input_term,
    handleInputTermChange,
    inputTermOptions,
    allow_anonymous_participation,
    voting_method,
    min_budget,
    max_budget,
    commenting_enabled,
    minBudgetError,
    maxBudgetError,
    handleMinBudgetingAmountChange,
    handleMaxBudgetingAmountChange,
    toggleCommentingEnabled,
    apiErrors,
    presentation_mode,
    handleIdeasDisplayChange,
    ideas_order,
    handleIdeaDefaultSortMethodChange,
    handleAllowAnonymousParticipationOnChange,
    handleVotingMethodOnChange,
  };

  const hasAnonymousParticipationEnabled = useFeatureFlag({
    name: 'anonymous_participation',
  });

  const votingMethodConfig = getVotingMethodConfig(voting_method);

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
      <VotingMethodSelector
        voting_method={voting_method}
        handleVotingMethodOnChange={handleVotingMethodOnChange}
      />
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.optionsToVoteOn} />
          <IconTooltip
            content={<FormattedMessage {...messages.optionsToVoteOnTooltip} />}
          />
        </SubSectionTitle>
        <FormattedMessage
          {...messages.optionsToVoteOnExplanation}
          values={{
            link: (
              <a
                href={`/admin/projects/${projectId}/ideas`}
                target="_blank"
                rel="noreferrer"
              >
                <FormattedMessage
                  {...messages.optionsToVoteOnExplanationLinkText}
                />
              </a>
            ),
          }}
        />
      </SectionField>
      {/* Render any voting method specific inputs from configuration */}
      {votingMethodConfig?.getVotingMethodInputs &&
        votingMethodConfig.getVotingMethodInputs(props)}
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.actionsForResidents} />
        </SubSectionTitle>

        <ToggleRow>
          <ToggleLabel>
            <FormattedMessage {...messages.inputCommentingEnabled} />
          </ToggleLabel>
          <Toggle
            checked={commenting_enabled as boolean}
            onChange={toggleCommentingEnabled}
          />
        </ToggleRow>
        <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
      </SectionField>

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />

      <SortingPicker
        options={[
          { key: 'random', value: 'random' },
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
