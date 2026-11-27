import React, { ReactNode, useId } from 'react';

import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import { CLError, CLErrors } from 'typings';

import { FieldError } from 'design-system/Field';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import PhaseActionAccessRow, {
  AccessOnlyAction,
} from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import phaseActionMessages from 'containers/Admin/projects/_shared/components/phaseActionMessages';
import useInputsNoun from 'containers/Admin/projects/_shared/components/useInputsNoun';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';

import messages from '../../../../../../messages';
import { ReactingLimitInput, StyledSectionField } from '../../shared/styling';

import ActionToggle from './ActionToggle';
import ActionToggleRow from './ActionToggleRow';

const UserActions = ({
  submission_enabled,
  commenting_enabled,
  reacting_enabled,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleReactingEnabled,
  apiErrors,
  reacting_like_method,
  reacting_like_limited_max,
  noLikingLimitError,
  handleReactingLikeMethodOnChange,
  handleLikingLimitOnChange,
  showCommentingToggle = true,
  showReactingToggle = true,
  phaseId,
  layout = 'page',
  accessOnlyActions = [],
  reactingSettings,
  participationMethod,
  inputTerm,
}: {
  showCommentingToggle?: boolean;
  showReactingToggle?: boolean;
  phaseId?: string;
  /** In the workspace panel the likes limit is shown by the caller. */
  layout?: 'page' | 'panel';
  accessOnlyActions?: AccessOnlyAction[];
  /** Shown right below the reacting toggle, before the access-only actions. */
  reactingSettings?: ReactNode;
  /** The panel names the actions after what participants post. */
  participationMethod?: ParticipationMethod;
  inputTerm?: InputTerm | null;
  submission_enabled: boolean;
  commenting_enabled: boolean;
  reacting_enabled: boolean;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleReactingEnabled: () => void;
  apiErrors: CLErrors | null | undefined;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  noLikingLimitError?: string;
  handleReactingLikeMethodOnChange: (
    reacting_like_method: 'unlimited' | 'limited'
  ) => void;
  handleLikingLimitOnChange: (reacting_like_limited_max: string) => void;
}) => {
  const { formatMessage } = useIntl();
  const getApiErrorMessage = useApiErrorText();
  const errorId = useId();
  const postingErrorId = `${errorId}-posting`;
  const commentingErrorId = `${errorId}-commenting`;
  const reactingErrorId = `${errorId}-reacting`;
  const panel = layout === 'panel';
  const inputs = useInputsNoun({ phaseId, participationMethod, inputTerm });
  const actionLabel = (
    pageMessage: typeof messages.inputPostingEnabled,
    panelMessage: typeof phaseActionMessages.submittingInputs
  ) =>
    panel
      ? formatMessage(panelMessage, { inputs })
      : formatMessage(pageMessage);

  // The panel shows errors as plain field error text, linked to the toggle.
  const actionError = (errors: CLError[] | undefined, id: string) => {
    if (!panel) return { error: <Error apiErrors={errors} /> };
    const message = getApiErrorMessage(errors);
    if (!message) return {};
    return {
      error: <FieldError id={id}>{message}</FieldError>,
      describedBy: id,
    };
  };

  const postingError = actionError(
    apiErrors?.submission_enabled,
    postingErrorId
  );
  const commentingError = actionError(
    apiErrors?.commenting_enabled,
    commentingErrorId
  );
  const reactingError = actionError(
    apiErrors?.reacting_enabled,
    reactingErrorId
  );

  const actions = (
    <>
      {!panel && (
        <SubSectionTitle>
          <FormattedMessage {...messages.enabledActionsForUsers} />
          <IconTooltip
            content={<FormattedMessage {...messages.enabledActionsTooltip} />}
          />
        </SubSectionTitle>
      )}

      <ActionToggleRow
        phaseId={phaseId}
        action="posting_idea"
        error={postingError.error}
      >
        <ActionToggle
          layout={layout}
          aria-describedby={postingError.describedBy}
          checked={submission_enabled || false}
          onChange={togglePostingEnabled}
          label={actionLabel(
            messages.inputPostingEnabled,
            phaseActionMessages.submittingInputs
          )}
        />
      </ActionToggleRow>

      {showCommentingToggle && (
        <ActionToggleRow
          phaseId={phaseId}
          action="commenting_idea"
          error={commentingError.error}
        >
          <ActionToggle
            layout={layout}
            aria-describedby={commentingError.describedBy}
            checked={commenting_enabled || false}
            onChange={toggleCommentingEnabled}
            label={actionLabel(
              messages.inputCommentingEnabled,
              phaseActionMessages.commentingOnInputs
            )}
          />
        </ActionToggleRow>
      )}

      {showReactingToggle && (
        <ActionToggleRow
          phaseId={phaseId}
          action="reacting_idea"
          last
          error={reactingError.error}
        >
          <ActionToggle
            layout={layout}
            aria-describedby={reactingError.describedBy}
            checked={reacting_enabled || false}
            onChange={toggleReactingEnabled}
            label={actionLabel(
              messages.inputReactingEnabled,
              phaseActionMessages.reactingToInputs
            )}
          />
        </ActionToggleRow>
      )}

      {reactingSettings}

      {phaseId && (
        <div>
          {accessOnlyActions.map(({ action, label }) => (
            <PhaseActionAccessRow
              key={action}
              phaseId={phaseId}
              action={action}
              label={label}
            />
          ))}
          <PhaseActionAccessRow
            phaseId={phaseId}
            action="attending_event"
            label={messages.attendingEventAction}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      {panel ? (
        <div>{actions}</div>
      ) : (
        <StyledSectionField>{actions}</StyledSectionField>
      )}
      {reacting_enabled && !panel && (
        <>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.likingMethodTitle} />
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
                  <FormattedMessage {...messages.maxLikes} />
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
        </>
      )}
    </>
  );
};

export default UserActions;
