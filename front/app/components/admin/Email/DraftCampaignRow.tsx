import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import { ICampaignData } from 'api/campaigns/types';
import useProjectById from 'api/projects/useProjectById';

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

const DraftCampaignRow = ({ campaign, context }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(campaign.attributes.context_id);
  const localize = useLocalize();

  const editLink: RouteType =
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
          <StatusLabel
            backgroundColor={colors.orange500}
            text={<FormattedMessage {...messages.draft} />}
          />
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
