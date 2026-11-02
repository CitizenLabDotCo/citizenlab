import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/Admin/projects/project/messages';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import ReactionLimitSettings from '../_shared/ReactionLimitSettings';

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
  const dislikingConfigurable = useFeatureFlag({ name: 'disable_disliking' });

  if (!reacting_enabled || !dislikingConfigurable) return null;

  return (
    <>
      <Box display="flex" alignItems="center" gap="4px" minHeight="36px">
        <Toggle
          variant="bo"
          checked={!!reacting_dislike_enabled}
          onChange={() =>
            handleReactingDislikeEnabledOnChange(!reacting_dislike_enabled)
          }
          label={
            <Text as="span" variant="boControl" m="0">
              {formatMessage(messages.dislikingPosts)}
            </Text>
          }
        />
        <IconTooltip
          content={formatMessage(messages.disableDislikingTooltip)}
        />
      </Box>
      <Error apiErrors={apiErrors && apiErrors.reacting_dislike_enabled} />
      {reacting_dislike_enabled && (
        <ReactionLimitSettings
          name="dislikingmethod"
          title={formatMessage(messages.dislikingMethodTitle)}
          method={reacting_dislike_method}
          max={reacting_dislike_limited_max}
          maxLabel={formatMessage(messages.maxDislikes)}
          onMethodChange={handleReactingDislikeMethodOnChange}
          onMaxChange={handleDislikingLimitOnChange}
          error={
            <Error
              text={noDislikingLimitError}
              apiErrors={apiErrors && apiErrors.reacting_limit}
            />
          }
        />
      )}
    </>
  );
};

export default DislikingToggle;
