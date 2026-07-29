import React, { useState } from 'react';

import { Box, StatusLabel, colors } from '@citizenlab/cl2-component-library';

import { ISmsDeliveryData } from 'api/campaigns/sms/deliveries/types';
import useSmsCampaignDeliveries from 'api/campaigns/sms/deliveries/useSmsCampaignDeliveries';
import useUserById from 'api/users/useUserById';

import { List, Row, TextCell } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import Pagination from 'components/Pagination';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

const statusColorMapping: {
  [k in ISmsDeliveryData['attributes']['status']]: string;
} = {
  pending: colors.grey200,
  queued: colors.grey300,
  sent: colors.blue500,
  delivered: colors.success,
  undelivered: colors.orange500,
  failed: colors.red600,
};

const TableRow = ({ delivery }: { delivery: ISmsDeliveryData }) => {
  const userId = delivery.relationships.user.data.id;
  const { data: user } = useUserById(userId);
  if (!user) return null;

  return (
    <Row>
      <TextCell>
        <Avatar userId={userId} size={30} />
      </TextCell>
      <TextCell className="expand">{getFullName(user.data)}</TextCell>
      <StatusLabel
        backgroundColor={statusColorMapping[delivery.attributes.status]}
        text={
          <FormattedMessage
            {...messages[`smsDeliveryStatus_${delivery.attributes.status}`]}
          />
        }
      />
    </Row>
  );
};

interface Props {
  campaignId: string;
  className?: string;
}

const DeliveriesTable = ({ campaignId, className }: Props) => {
  const [pageNumber, setPageNumber] = useState(1);
  const { data: deliveries } = useSmsCampaignDeliveries({
    campaignId,
    pageNumber,
    pageSize: 10,
  });

  if (!deliveries) return null;

  return (
    <>
      <Box mb="24px">
        <List
          className={className}
          key={deliveries.data.map((delivery) => delivery.id).join()}
        >
          {deliveries.data.map((delivery) => (
            <TableRow delivery={delivery} key={delivery.id} />
          ))}
        </List>
      </Box>
      <Pagination
        currentPage={pageNumber}
        totalPages={getPageNumberFromUrl(deliveries.links.last) || 1}
        loadPage={setPageNumber}
      />
    </>
  );
};

export default DeliveriesTable;
