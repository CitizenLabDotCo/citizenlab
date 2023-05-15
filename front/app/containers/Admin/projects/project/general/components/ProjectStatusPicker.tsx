import React from 'react';

// components
import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { PublicationStatus } from 'api/projects/types';

interface Props {
  publicationStatus: PublicationStatus;
  handleStatusChange: (value: PublicationStatus) => void;
}

export default ({ publicationStatus, handleStatusChange }: Props) => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.statusLabel} />
      <IconTooltip
        content={<FormattedMessage {...messages.publicationStatusTooltip} />}
      />
    </SubSectionTitle>
    <Radio
      onChange={handleStatusChange}
      currentValue={publicationStatus}
      value="draft"
      name="projectstatus"
      id="projecstatus-draft"
      className="e2e-projecstatus-draft"
      label={<FormattedMessage {...messages.draftStatus} />}
    />
    <Radio
      onChange={handleStatusChange}
      currentValue={publicationStatus}
      value="published"
      name="projectstatus"
      id="projecstatus-published"
      className="e2e-projecstatus-published"
      label={<FormattedMessage {...messages.publishedStatus} />}
    />
    <Radio
      onChange={handleStatusChange}
      currentValue={publicationStatus}
      value="archived"
      name="projectstatus"
      id="projecstatus-archived"
      className="e2e-projecstatus-archived"
      label={<FormattedMessage {...messages.archivedStatus} />}
    />
  </StyledSectionField>
);
