import React from 'react';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';

interface Props {
  initiativeId: string;
  requiredNumberOfCosponsors: number;
}

const CosponsorShipReminder = ({
  initiativeId,
  requiredNumberOfCosponsors,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Warning>
      <FormattedMessage
        {...messages.numberOfCosponsorsNotYetMet}
        values={{
          requiredNumberOfCosponsors,
          manageInvitationsLink: (
            <Link to={`/initiatives/edit/${initiativeId}`}>
              {formatMessage(messages.manageInvitationsLinkText)}
            </Link>
          ),
        }}
      />
    </Warning>
  );
};

export default CosponsorShipReminder;
