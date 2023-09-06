import React from 'react';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import Warning from 'components/UI/Warning';
import { MAX_NUMBER_OF_COSPONSORS } from 'components/InitiativeForm';
import Link from 'utils/cl-router/Link';

interface Props {
  initiativeId: string;
}

const CosponsorShipReminder = ({ initiativeId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Warning>
      <>
        {formatMessage(messages.numberOfCosponsorsNotYetMet)}
        <br />
        <br />
        <FormattedMessage
          {...messages.remindOrInviteMoreCosponsors}
          values={{
            maxNoOfCosponsors: MAX_NUMBER_OF_COSPONSORS,
            inviteMoreLink: (
              <Link to={`/initiatives/edit/${initiativeId}`}>
                {formatMessage(messages.inviteMoreLinkText)}
              </Link>
            ),
          }}
        />
      </>
    </Warning>
  );
};

export default CosponsorShipReminder;
