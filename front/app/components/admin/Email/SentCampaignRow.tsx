import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { FormattedDate, FormattedTime } from 'react-intl';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import { ICampaignData } from 'api/campaigns/types';

import { Row } from 'components/admin/ResourceList';
import T from 'components/T';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaign: ICampaignData;
}

const SentCampaignRow = ({ campaign }: Props) => {
  const { projectId } = useParams();
  const statsLink: RouteType = projectId
    ? `/admin/projects/${projectId}/messaging/${campaign.id}`
    : `/admin/messaging/emails/custom/${campaign.id}`;

  return (
    <Row id={campaign.id}>
      <Box>
        <Title color="primary" variant="h4" m="0px">
          <T value={campaign.attributes.subject_multiloc} />
        </Title>
        <Box display="flex" alignItems="center" gap="12px">
          <div>
            <FormattedDate value={campaign.attributes.updated_at} />
            &nbsp;
            <FormattedTime value={campaign.attributes.updated_at} />
          </div>
          <StatusLabel
            backgroundColor={colors.success}
            text={<FormattedMessage {...messages.sent} />}
          />
        </Box>
      </Box>

      <Box minWidth="220px" display="flex" justifyContent="flex-end" gap="40px">
        <Box>
          <Title color="primary" variant="h4" m="0px" fontSize="xl">
            {(
              ((campaign.attributes.delivery_stats?.opened || 0) /
                (campaign.attributes.delivery_stats?.total || 1)) *
              100
            ).toFixed(0)}
            %
          </Title>
          <Text m="0px">
            <FormattedMessage {...messages.opened} />
          </Text>
        </Box>
        <Box>
          <Title color="primary" variant="h4" m="0px" fontSize="xl">
            {(
              ((campaign.attributes.delivery_stats?.clicked || 0) /
                (campaign.attributes.delivery_stats?.total || 1)) *
              100
            ).toFixed(0)}
            %
          </Title>
          <Text m="0px">
            <FormattedMessage {...messages.clicked} />
          </Text>
        </Box>
        <Button linkTo={statsLink} icon="chart-bar" buttonStyle="text">
          <FormattedMessage {...messages.statsButton} />
        </Button>
      </Box>
    </Row>
  );
};

export default SentCampaignRow;
