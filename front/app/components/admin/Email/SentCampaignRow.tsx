import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { FormattedDate, FormattedTime } from 'react-intl';
import { RouteType } from 'routes';

import { ICampaignData } from 'api/campaigns/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import T from 'components/T';
import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaign: ICampaignData;
  context?: 'global' | 'project';
}

const SentCampaignRow = ({ campaign, context }: Props) => {
  const { data: project } = useProjectById(campaign.attributes.context_id);
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const statsLink: RouteType =
    context === 'global'
      ? `/admin/messaging/emails/custom/${campaign.id}`
      : `/admin/projects/${campaign.attributes.context_id}/messaging/${campaign.id}`;

  return (
    <Row id={campaign.id}>
      <Box>
        <Title color="primary" variant="h4" m="0px">
          <T value={campaign.attributes.subject_multiloc} />
        </Title>
        <Box display="flex" alignItems="center" gap="12px">
          <Text m="0px" fontSize="s">
            <FormattedDate value={campaign.attributes.updated_at} />
            &nbsp;
            <FormattedTime value={campaign.attributes.updated_at} />
          </Text>
          <StatusLabel
            backgroundColor={colors.success}
            text={<FormattedMessage {...messages.sent} />}
          />
          {/* Only display project name in the global messaging tab */}
          {context === 'global' && project && (
            <Text m="0px" fontSize="s">
              {formatMessage(messages.project)}:{' '}
              {localize(project.data.attributes.title_multiloc)}
            </Text>
          )}
        </Box>
      </Box>

      <Box
        minWidth="220px"
        display="flex"
        justifyContent="flex-end"
        gap="40px"
        alignItems="center"
      >
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Title color="primary" variant="h4" m="0px">
            {(
              ((campaign.attributes.delivery_stats?.opened || 0) /
                (campaign.attributes.delivery_stats?.total || 1)) *
              100
            ).toFixed(0)}
            %
          </Title>
          <Text m="0px" fontSize="s">
            <FormattedMessage {...messages.opened} />
          </Text>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Title color="primary" variant="h4" m="0px">
            {(
              ((campaign.attributes.delivery_stats?.clicked || 0) /
                (campaign.attributes.delivery_stats?.total || 1)) *
              100
            ).toFixed(0)}
            %
          </Title>
          <Text m="0px" fontSize="s">
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
