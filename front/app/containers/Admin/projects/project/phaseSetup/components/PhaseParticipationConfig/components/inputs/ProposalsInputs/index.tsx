import React, { ReactNode } from 'react';

import { Input, IOption } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  IdeaSortMethod,
  InputTerm,
  PresentationMode,
  PrescreeningMode,
} from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ExpandAllContext from 'containers/Admin/projects/_shared/components/SettingsPanel/ExpandAllContext';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
import messages from 'containers/Admin/projects/project/messages';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useSearch } from 'utils/router';

import configMessages from '../../../messages';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import ViewSelector from '../../shared/ViewSelector';
import ModerationAssignee from '../_shared/ModerationAssignee';
import NumberSettingRow from '../_shared/NumberSettingRow';
import PrescreeningModeSelector from '../_shared/PrescreeningModeSelector';
import ReactionLimitSettings from '../_shared/ReactionLimitSettings';
import SortingPicker from '../_shared/SortingPicker';
import useAssigneeSummary from '../_shared/useAssigneeSummary';
import useParticipantActionsSummary from '../_shared/useParticipantActionsSummary';
import UserActions from '../_shared/UserActions';

import styles from './ProposalsInputs.module.css';
import 'design-system/tokens.css';

const NO_EXPAND_ALL = { count: 0, opened: false };

interface Props {
  moderationAction?: ReactNode;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  submission_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  toggleAnonymousPostingDisabledReason?: string;
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
  presentation_mode: 'card' | 'map' | 'feed' | null | undefined;
  available_views: PresentationMode[] | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  handleAvailableViewsChange: (
    available_views: PresentationMode[],
    presentation_mode?: PresentationMode
  ) => void;
  ideas_order: IdeaSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
  handleDaysLimitChange: (limit: string) => void;
  handleReactingThresholdChange: (threshold: string) => void;
  prescreening_mode: PrescreeningMode | null | undefined;
  onPrescreeningModeChange: (mode: PrescreeningMode | null) => void;
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  layout?: 'page' | 'panel';
  phaseId?: string;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
}

const ProposalsInputs = ({
  moderationAction,
  input_term,
  handleInputTermChange,
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
  reacting_like_method,
  allow_anonymous_participation,
  toggleAnonymousPostingDisabledReason,
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
  available_views,
  handleIdeasDisplayChange,
  handleAvailableViewsChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
  handleDaysLimitChange,
  handleReactingThresholdChange,
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
  const { setup_action } = useSearch({ strict: false });
  const assigneeSummary = useAssigneeSummary(phaseId);
  const actionsSummary = useParticipantActionsSummary({
    submission_enabled,
    commenting_enabled,
    reacting_enabled,
  });
  const getApiErrorMessage = useApiErrorText();
  const prescreeningFeatureEnabled = useFeatureFlag({
    name: 'prescreening',
  });

  const inputTerm = (
    <CustomFieldPicker
      input_term={input_term}
      handleInputTermChange={handleInputTermChange}
    />
  );

  const expiry = (
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
  );

  const threshold = (
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
  );

  const requirements = (
    <PanelGroup
      label={formatMessage(configMessages.proposalRequirementsGroup)}
      reviewKey="proposal_requirements"
      hasError={
        !!reactingThresholdError ||
        !!expireDateLimitError ||
        !!apiErrors?.reacting_threshold ||
        !!apiErrors?.expire_days_limit
      }
      summary={
        reacting_threshold && expire_days_limit
          ? formatMessage(configMessages.proposalRequirementsSummary, {
              votes: reacting_threshold,
              days: expire_days_limit,
            })
          : undefined
      }
    >
      <NumberSettingRow
        id="reacting_threshold"
        label={formatMessage(messages.reactingThreshold)}
        value={reacting_threshold}
        min={2}
        onChange={handleReactingThresholdChange}
        errorMessage={
          [
            reactingThresholdError,
            getApiErrorMessage(apiErrors?.reacting_threshold),
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      <NumberSettingRow
        id="expire_days_limit"
        label={formatMessage(messages.expireDaysLimit)}
        value={expire_days_limit}
        min={1}
        onChange={handleDaysLimitChange}
        errorMessage={
          [
            expireDateLimitError,
            getApiErrorMessage(apiErrors?.expire_days_limit),
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      <p className={styles.note}>
        {formatMessage(configMessages.proposalRequirementsNote)}
      </p>
    </PanelGroup>
  );

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

  const screening = prescreeningFeatureEnabled ? (
    <PrescreeningModeSelector
      variant={layout === 'panel' ? 'panel' : undefined}
      prescreening_mode={prescreening_mode}
      onPrescreeningModeChange={onPrescreeningModeChange}
    />
  ) : null;

  const likes = reacting_enabled && (
    <ReactionLimitSettings
      name="likingmethod"
      title={formatMessage(messages.likingMethodTitle)}
      method={reacting_like_method}
      max={reacting_like_limited_max}
      maxLabel={formatMessage(messages.maxLikes)}
      onMethodChange={handleReactingLikeMethodOnChange}
      onMaxChange={handleLikingLimitOnChange}
      methodError={getApiErrorMessage(apiErrors?.reacting_method)}
      maxError={
        [noLikingLimitError, getApiErrorMessage(apiErrors?.reacting_limit)]
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  );

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
      reactingSettings={
        layout === 'panel' && (
          <div className={styles.reactingSettings}>{likes}</div>
        )
      }
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
      inputTerm={input_term}
      variant={layout === 'panel' ? 'panel' : undefined}
      presentation_mode={presentation_mode}
      available_views={available_views}
      apiErrors={apiErrors}
      handleIdeasDisplayChange={handleIdeasDisplayChange}
      handleAvailableViewsChange={handleAvailableViewsChange}
      hideFeed
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
        { key: 'status_priority', value: 'status_priority' },
      ]}
      ideas_order={ideas_order}
      apiErrors={apiErrors}
      handleIdeaDefaultSortMethodChange={handleIdeaDefaultSortMethodChange}
    />
  );

  if (layout === 'panel') {
    return (
      <>
        <div className={styles.heading}>
          <PanelHeading
            label={formatMessage(configMessages.howProposalsAreShown)}
          />
        </div>
        <ExpandAllContext.Provider value={NO_EXPAND_ALL}>
          {views}
          {sorting}
        </ExpandAllContext.Provider>
        <div className={styles.heading}>
          <PanelHeading
            label={formatMessage(configMessages.settingsGroup)}
            expandable
          />
        </div>
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          reviewKey="participant_actions"
          summary={actionsSummary}
          hasError={
            !!noLikingLimitError ||
            !!apiErrors?.reacting_limit ||
            !!apiErrors?.reacting_method ||
            !!apiErrors?.submission_enabled ||
            !!apiErrors?.commenting_enabled ||
            !!apiErrors?.reacting_enabled
          }
        >
          {userActions}
        </PanelGroup>
        {requirements}
        <div id="phase-moderation-settings">
          <PanelGroup
            label={formatMessage(configMessages.moderationGroup)}
            // An unsaved phase keeps it open for its save-first action.
            defaultOpen={!phaseId || setup_action === 'moderation'}
            summary={assigneeSummary}
          >
            <div className={styles.moderation}>
              {!phaseId && moderationAction}
              <ModerationAssignee phaseId={phaseId} />
              {screening}
              {anonymity}
              {similarity}
            </div>
          </PanelGroup>
        </div>
      </>
    );
  }

  return (
    <>
      {inputTerm}
      {expiry}
      {threshold}
      {anonymity}
      {screening}
      {userActions}
      {similarity}
      {views}
      {sorting}
    </>
  );
};

export default ProposalsInputs;
