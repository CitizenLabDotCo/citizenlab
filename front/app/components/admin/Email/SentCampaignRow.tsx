import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { RouteType } from 'routes';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ICampaignData } from 'api/campaigns/types';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaign: ICampaignData;
  context?: 'global' | 'project';
}

const SentCampaignRow = ({ campaign, context }: Props) => {
  const { data: project } = useProjectById(
    campaign.relationships.context?.data?.id
  );
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isCustomSmtp = useFeatureFlag({ name: 'custom_smtp' });

  const statsLink: RouteType =
    context === 'global'
      ? `/admin/messaging/emails/custom/${campaign.id}`
      : `/admin/projects/${campaign.relationships.context?.data?.id}/messaging/${campaign.id}`;
  const { data: tenant } = useAppConfiguration();
  const timeZone = tenant?.data.attributes.settings.core.timezone || 'UTC';

  return (
    <Row id={campaign.id}>
      <Box>
        <Title color="primary" variant="h4" m="0px">
          <T value={campaign.attributes.subject_multiloc} />
        </Title>
        <Box display="flex" alignItems="center" gap="12px">
          <StatusLabel
            backgroundColor={colors.success}
            text={<FormattedMessage {...messages.sent} />}
          />

          <Text as="span" fontSize="base" mb="0px" color="textSecondary">
            {moment(campaign.attributes.updated_at).tz(timeZone).format('LLL')}
          </Text>

          {/* Only display project name in the global messaging tab */}
          {context === 'global' && project && (
            <>
              <Text as="span" mb="0px" color="textSecondary">
                &bull;
              </Text>
              <Text as="span" fontSize="base" mb="0px" color="textSecondary">
                {formatMessage(messages.project)}:{' '}
                {localize(project.data.attributes.title_multiloc)}
              </Text>
            </>
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
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          style={isCustomSmtp ? { opacity: 0.4 } : undefined}
        >
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
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          style={isCustomSmtp ? { opacity: 0.4 } : undefined}
        >
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
        <ButtonWithLink linkTo={statsLink} icon="chart-bar" buttonStyle="text">
          <FormattedMessage {...messages.statsButton} />
        </ButtonWithLink>
      </Box>
    </Row>
  );
};

export default SentCampaignRow;
