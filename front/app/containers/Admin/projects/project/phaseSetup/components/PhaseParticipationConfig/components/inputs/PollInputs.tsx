import React from 'react';

import { IconTooltip, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../messages';

interface Props {
  poll_anonymous: boolean | undefined;
  apiErrors: CLErrors | null | undefined;
  togglePollAnonymous: () => void;
}

export default ({ poll_anonymous, apiErrors, togglePollAnonymous }: Props) => (
  <>
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.anonymousPolling} />
        <IconTooltip
          content={<FormattedMessage {...messages.anonymousPollingTooltip} />}
        />
      </SubSectionTitle>

      <Toggle
        checked={poll_anonymous as boolean}
        onChange={togglePollAnonymous}
      />

      <Error apiErrors={apiErrors && apiErrors.poll_anonymous} />
    </SectionField>
  </>
);
