import React from 'react';

import { IconTooltip, Radio, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';

import messages from '../../../../../../messages';
import {
  ReactingLimitInput,
  StyledSectionField,
  ToggleRow,
} from '../../shared/styling';

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
}: {
  showCommentingToggle?: boolean;
  showReactingToggle?: boolean;
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
  return (
    <>
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.enabledActionsForUsers} />
          <IconTooltip
            content={<FormattedMessage {...messages.enabledActionsTooltip} />}
          />
        </SubSectionTitle>

        <ToggleRow>
          <Toggle
            checked={submission_enabled || false}
            onChange={togglePostingEnabled}
            label={formatMessage(messages.inputPostingEnabled)}
          />
          <Error apiErrors={apiErrors && apiErrors.submission_enabled} />
        </ToggleRow>

        {showCommentingToggle && (
          <ToggleRow>
            <Toggle
              checked={commenting_enabled || false}
              onChange={toggleCommentingEnabled}
              label={formatMessage(messages.inputCommentingEnabled)}
            />
            <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
          </ToggleRow>
        )}

        {showReactingToggle && (
          <ToggleRow className="last">
            <Toggle
              checked={reacting_enabled || false}
              onChange={toggleReactingEnabled}
              label={formatMessage(messages.inputReactingEnabled)}
            />
            <Error apiErrors={apiErrors && apiErrors.reacting_enabled} />
          </ToggleRow>
        )}
      </StyledSectionField>
      {reacting_enabled && (
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
