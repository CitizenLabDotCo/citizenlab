import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  initiativeId: string;
}

const CosponsorShipReminder = ({ initiativeId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const requiredNumberOfCosponsors =
    appConfiguration?.data.attributes.settings.initiatives.cosponsors_number;

  if (typeof requiredNumberOfCosponsors !== 'number') return null;

  return (
    <Warning>
      <FormattedMessage
        {...messages.numberOfCosponsorsNotYetMet}
        values={{
          requiredNumberOfCosponsors,
          manageInvitationsLink: (
            <Link to={`/initiatives/edit/${initiativeId}`} scrollToTop>
              {formatMessage(messages.manageInvitationsLinkText)}
            </Link>
          ),
        }}
      />
    </Warning>
  );
};

export default CosponsorShipReminder;
