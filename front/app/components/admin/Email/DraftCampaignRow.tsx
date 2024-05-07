import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
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

const DraftCampaignRow = ({ campaign }: Props) => {
  const { projectId } = useParams();
  const editLink: RouteType = projectId
    ? `/admin/projects/${projectId}/messaging/${campaign.id}`
    : `/admin/messaging/emails/custom/${campaign.id}`;

  return (
    <Row id={campaign.id}>
      <Box>
        <Title color="primary" variant="h4" m="0px">
          <T value={campaign.attributes.subject_multiloc} />
        </Title>
        <StatusLabel
          backgroundColor={colors.orange}
          text={<FormattedMessage {...messages.draft} />}
        />
      </Box>
      <Box minWidth="220px" display="flex" justifyContent="flex-end">
        <Button linkTo={editLink} buttonStyle="secondary" icon="edit">
          <FormattedMessage {...messages.manageButtonLabel} />
        </Button>
      </Box>
    </Row>
  );
};

export default DraftCampaignRow;
