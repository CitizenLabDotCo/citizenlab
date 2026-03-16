import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ICampaignData } from 'api/campaigns/types';
import { isDraft } from 'api/campaigns/util';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { formatDateinTimezone } from 'utils/dateUtils';

import messages from './messages';

interface Props {
  campaign: ICampaignData;
  context?: 'global' | 'project';
}

const DraftCampaignRow = ({ campaign, context }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(
    campaign.relationships.context?.data?.id
  );
  const localize = useLocalize();

  const editLink: RouteType =
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
          {campaign.attributes.scheduled_at && (
            <>
              <Text fontSize="base">
                {formatDateinTimezone(
                  campaign.attributes.scheduled_at,
                  timeZone
                )}
              </Text>
              <StatusLabel
                backgroundColor={colors.teal500}
                text={<FormattedMessage {...messages.scheduled} />}
              />
            </>
          )}
          {isDraft(campaign) && (
            <StatusLabel
              backgroundColor={colors.orange500}
              text={<FormattedMessage {...messages.draft} />}
            />
          )}
          {/* Only display project name in the global messaging tab */}
          {context === 'global' && project && (
            <Text m="0px">
              {formatMessage(messages.project)}:{' '}
              {/* TODO: Fix this the next time the file is edited. */}
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
              {localize(project?.data.attributes.title_multiloc)}
            </Text>
          )}
        </Box>
      </Box>

      <Box minWidth="220px" display="flex" justifyContent="flex-end">
        <ButtonWithLink
          linkTo={editLink}
          buttonStyle="secondary-outlined"
          icon="edit"
        >
          <FormattedMessage {...messages.manageButtonLabel} />
        </ButtonWithLink>
      </Box>
    </Row>
  );
};

export default DraftCampaignRow;
