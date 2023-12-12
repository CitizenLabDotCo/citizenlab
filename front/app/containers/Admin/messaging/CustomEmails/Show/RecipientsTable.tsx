import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import { StatusLabel, colors } from '@citizenlab/cl2-component-library';
import { IDeliveryData } from 'api/campaign_deliveries/types';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Pagination from 'components/admin/Pagination';
import Avatar from 'components/Avatar';
import useUserById from 'api/users/useUserById';
import { getFullName } from 'utils/textUtils';

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

interface Props {
  campaignId: string;
  className?: string;
  deliveries: IDeliveryData[] | null;
  currentPage: number;
  lastPage: number;
  onChangePage: (pageNumber: number) => void;
}

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
      <TextCell>{getFullName(user.data)}</TextCell>
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
  className,
  currentPage,
  lastPage,
  onChangePage,
  deliveries,
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

export default RecipientsTable;
