import React from 'react';

import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import FeatureFlag from 'components/FeatureFlag';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';
import { ReactingLimitInput } from '../../shared/styling';

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

const DislikingSettings = ({
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
  if (!reacting_enabled) return null;

  return (
    <FeatureFlag name="disable_disliking">
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.dislikingPosts} />
          <IconTooltip
            content={<FormattedMessage {...messages.disableDislikingTooltip} />}
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
        <Error apiErrors={apiErrors && apiErrors.reacting_dislike_enabled} />
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
  );
};

export default DislikingSettings;
