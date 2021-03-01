import React from 'react';
import GetCampaignRecipients, {
  GetCampaignDeliveriesChildProps,
} from 'resources/GetCampaignDeliveries';
import { isNilOrError } from 'utils/helperUtils';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import GetUser from 'resources/GetUser';
import { StatusLabel } from 'cl2-component-library';
import { IDeliveryData } from 'services/campaigns';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Pagination from 'components/admin/Pagination';
import Avatar from 'components/Avatar';

const statusColorMapping: {
  [k in IDeliveryData['attributes']['delivery_status']]: keyof typeof colors;
} = {
  sent: 'lightGreyishBlue',
  bounced: 'clRedError',
  failed: 'clRedError',
  accepted: 'lightGreyishBlue',
  delivered: 'clBlueLight',
  opened: 'clGreenSuccess',
  clicked: 'clGreenSuccess',
};

interface InputProps {
  campaignId: string;
  className?: string;
}

interface DataProps extends GetCampaignDeliveriesChildProps {}

interface Props extends InputProps, DataProps {}

class RecipientsTable extends React.PureComponent<Props> {
  render() {
    const { deliveries, className, currentPage, lastPage } = this.props;
    if (isNilOrError(deliveries)) {
      return null;
    }

    return (
      <List className={className} key={deliveries.map((d) => d.id).join()}>
        {deliveries.map((recipient) => (
          <Row key={recipient.id}>
            <GetUser id={recipient.relationships.user.data.id}>
              {(user) =>
                isNilOrError(user) ? null : (
                  <>
                    <TextCell>
                      <Avatar userId={user.id} size={30} />
                    </TextCell>
                    <TextCell>
                      {user.attributes.first_name} {user.attributes.last_name}
                    </TextCell>
                    <TextCell className="expand">
                      {user.attributes.email}
                    </TextCell>
                    <StatusLabel
                      backgroundColor={
                        statusColorMapping[recipient.attributes.delivery_status]
                      }
                      text={
                        <FormattedMessage
                          {...messages[
                            `deliveryStatus_${recipient.attributes.delivery_status}`
                          ]}
                        />
                      }
                    />
                  </>
                )
              }
            </GetUser>
          </Row>
        ))}
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          loadPage={this.props.onChangePage}
        />
      </List>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetCampaignRecipients campaignId={inputProps.campaignId} pageSize={15}>
    {(deliveries) => <RecipientsTable {...inputProps} {...deliveries} />}
  </GetCampaignRecipients>
);
