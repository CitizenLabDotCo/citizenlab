import React from 'react';
import GetCampaignRecipients, {
  GetCampaignDeliveriesChildProps,
} from 'resources/GetCampaignDeliveries';
import { isNilOrError } from 'utils/helperUtils';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { IDeliveryData } from 'services/campaigns';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Pagination from 'components/admin/Pagination';
import Avatar from 'components/Avatar';
import useUserById from 'api/users/useUserById';

const statusColorMapping: {
  [k in IDeliveryData['attributes']['delivery_status']]: string;
} = {
  sent: colors.blue500,
  bounced: colors.red600,
  failed: colors.red600,
  accepted: colors.grey200,
  delivered: colors.teal300,
  opened: colors.success,
  clicked: colors.success,
};

interface InputProps {
  campaignId: string;
  className?: string;
}

interface DataProps extends GetCampaignDeliveriesChildProps {}

interface Props extends InputProps, DataProps {}

const TableRow = ({
  userId,
  recipient,
}: {
  userId: string;
  recipient: IDeliveryData;
}) => {
  const { data: user } = useUserById(userId);
  if (!user) return null;
  return (
    <Row>
      <TextCell>
        <Avatar userId={userId} size={30} />
      </TextCell>
      <TextCell>
        {user.data.attributes.first_name} {user.data.attributes.last_name}
      </TextCell>
      <TextCell className="expand">{user.data.attributes.email}</TextCell>
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
    </Row>
  );
};

const RecipientsTable = ({
  deliveries,
  className,
  currentPage,
  lastPage,
  onChangePage,
}: Props) => {
  if (isNilOrError(deliveries)) {
    return null;
  }

  return (
    <List className={className} key={deliveries.map((d) => d.id).join()}>
      {deliveries.map((recipient) => (
        <TableRow
          recipient={recipient}
          userId={recipient.relationships.user.data.id}
          key={recipient.id}
        />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={lastPage}
        loadPage={onChangePage}
      />
    </List>
  );
};

export default (inputProps: InputProps) => (
  <GetCampaignRecipients campaignId={inputProps.campaignId} pageSize={15}>
    {(deliveries) => <RecipientsTable {...inputProps} {...deliveries} />}
  </GetCampaignRecipients>
);
