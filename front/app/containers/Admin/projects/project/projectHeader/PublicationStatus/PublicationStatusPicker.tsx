import React from 'react';

import { Radio } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  publicationStatus: PublicationStatus;
  handleStatusChange: (value: PublicationStatus) => void;
}

const PublicationStatusPicker = ({
  publicationStatus,
  handleStatusChange,
}: Props) => (
  <div>
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
  </div>
);

export default PublicationStatusPicker;
