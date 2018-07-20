import React from 'react';
import GetCampaignRecipients, { GetCampaignRecipientsChildProps } from 'resources/GetCampaignRecipients';
import { isNilOrError } from 'utils/helperUtils';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import GetUser from 'resources/GetUser';
import StatusLabel from 'components/UI/StatusLabel';
import { IRecipientData } from 'services/campaigns';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const statusColorMapping: { [k in IRecipientData['attributes']['delivery_status']]: keyof typeof colors } = {
  sent: 'lightGreyishBlue',
  bounced: 'error',
  failed: 'error',
  accepted: 'lightGreyishBlue',
  delivered: 'clBlueLight',
  opened: 'success',
  clicked: 'success',
};

interface InputProps {
  campaignId: string;
  className?: string;
}

interface DataProps {
  recipients: GetCampaignRecipientsChildProps;
}

interface Props extends InputProps, DataProps {}

class RecipientsTable extends React.PureComponent<Props> {

  render() {
    const { recipients, className } = this.props;
    if (isNilOrError(recipients)) {
      return null;
    }

    return (
      <List className={className}>
        {recipients.map((recipient) => (
          <Row key={recipient.id}>
            <GetUser id={recipient.relationships.user.data.id}>
              {(user) => isNilOrError(user) ? null : (
                <>
                  <TextCell className="expand">
                    {user.attributes.email}
                  </TextCell>
                  <StatusLabel color={statusColorMapping[recipient.attributes.delivery_status]}>
                    <FormattedMessage {...messages[`deliveryStatus_${recipient.attributes.delivery_status}`]} />
                  </StatusLabel>
                </>
              )}
            </GetUser>
          </Row>
        ))}
      </List>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetCampaignRecipients campaignId={inputProps.campaignId}>
    {(recipients) => <RecipientsTable {...inputProps} recipients={recipients} />}
  </GetCampaignRecipients>
);
