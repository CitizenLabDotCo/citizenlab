import React from 'react';

import { CLErrors } from 'typings';

import Banner from 'design-system/Banner';
import Switch from 'design-system/Switch';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/Admin/projects/project/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { useIntl } from 'utils/cl-intl';

import ReactionLimitSettings from '../_shared/ReactionLimitSettings';

import styles from './DislikingToggle.module.css';
import 'design-system/tokens.css';

interface Props {
  reacting_enabled?: boolean | null;
  reacting_dislike_enabled: boolean | null | undefined;
  reacting_dislike_method: 'unlimited' | 'limited' | null | undefined;
  reacting_dislike_limited_max: number | null | undefined;
  noDislikingLimitError?: string;
  apiErrors: CLErrors | null | undefined;
  handleReactingDislikeEnabledOnChange: (
    reacting_dislike_enabled: boolean
  ) => void;
  handleReactingDislikeMethodOnChange: (
    reacting_dislike_method: 'unlimited' | 'limited'
  ) => void;
  handleDislikingLimitOnChange: (reacting_dislike_limited_max: string) => void;
}

const DislikingToggle = ({
  reacting_enabled,
  reacting_dislike_enabled,
  reacting_dislike_method,
  reacting_dislike_limited_max,
  noDislikingLimitError,
  apiErrors,
  handleReactingDislikeEnabledOnChange,
  handleReactingDislikeMethodOnChange,
  handleDislikingLimitOnChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const getApiErrorMessage = useApiErrorText();
  const dislikingConfigurable = useFeatureFlag({ name: 'disable_disliking' });

  if (!reacting_enabled || !dislikingConfigurable) return null;

  const enabledError = getApiErrorMessage(apiErrors?.reacting_dislike_enabled);
  const limitError = [
    noDislikingLimitError,
    getApiErrorMessage(apiErrors?.reacting_limit),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={styles.toggleRow}>
        <Switch
          size={26}
          isSelected={!!reacting_dislike_enabled}
          onChange={() =>
            handleReactingDislikeEnabledOnChange(!reacting_dislike_enabled)
          }
        >
          <span
            className={styles.label}
            data-off={!reacting_dislike_enabled || undefined}
          >
            {formatMessage(messages.dislikingPosts2)}
          </span>
        </Switch>
      </div>
      {enabledError && <Banner tone="error">{enabledError}</Banner>}
      {reacting_dislike_enabled && (
        <div className={styles.settings}>
          <ReactionLimitSettings
            name="dislikingmethod"
            nested
            title={formatMessage(messages.dislikingMethodTitle)}
            method={reacting_dislike_method}
            max={reacting_dislike_limited_max}
            maxLabel={formatMessage(messages.maxDislikes)}
            onMethodChange={handleReactingDislikeMethodOnChange}
            onMaxChange={handleDislikingLimitOnChange}
            maxError={limitError || undefined}
          />
        </div>
      )}
    </>
  );
};

export default DislikingToggle;
