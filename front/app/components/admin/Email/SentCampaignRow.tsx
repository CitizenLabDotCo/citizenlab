import React from 'react';

import { Box, StatusLabel, colors } from '@citizenlab/cl2-component-library';
import { FormattedDate, FormattedTime } from 'react-intl';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import { ICampaignData } from 'api/campaigns/types';

import { Row, TextCell } from 'components/admin/ResourceList';
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
      <TextCell className="expand">
        <T value={campaign.attributes.subject_multiloc} />
      </TextCell>
      <div>
        <FormattedDate value={campaign.attributes.updated_at} />
        &nbsp;
        <FormattedTime value={campaign.attributes.updated_at} />
      </div>
      <StatusLabel
        minWidth="94px"
        backgroundColor={colors.success}
        text={<FormattedMessage {...messages.sent} />}
      />
      <Box minWidth="220px" display="flex" justifyContent="flex-end">
        <Button linkTo={statsLink} icon="chart-bar" buttonStyle="text">
          <FormattedMessage {...messages.statsButton} />
        </Button>
      </Box>
    </Row>
  );
};

export default SentCampaignRow;
