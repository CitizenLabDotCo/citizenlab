import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';

import { ICampaignData } from 'api/campaigns/types';
import { isDraft } from 'api/campaigns/util';

import useLocalize from 'hooks/useLocalize';

import { Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  campaign: ICampaignData;
}

const SmsCampaignRow = ({ campaign }: Props) => {
  const localize = useLocalize();
  const body = localize(campaign.attributes.body_multiloc);
  const snippet = body.length > 90 ? `${body.slice(0, 90)}…` : body;

  return (
    <Row id={campaign.id}>
      <Box>
        <Title color="primary" variant="h4" m="0px">
          {snippet}
        </Title>
        <Box display="flex" alignItems="center" gap="12px" mt="4px">
          {isDraft(campaign) ? (
            <StatusLabel
              backgroundColor={colors.orange500}
              text={<FormattedMessage {...messages.draft} />}
            />
          ) : (
            <StatusLabel
              backgroundColor={colors.success}
              text={<FormattedMessage {...messages.sent} />}
            />
          )}
        </Box>
      </Box>

      <Box minWidth="220px" display="flex" justifyContent="flex-end">
        <ButtonWithLink
          to="/admin/messaging/sms/$campaignId"
          params={{ campaignId: campaign.id }}
          buttonStyle="secondary-outlined"
          icon="edit"
        >
          <FormattedMessage {...messages.manageButtonLabel} />
        </ButtonWithLink>
      </Box>
    </Row>
  );
};

export default SmsCampaignRow;
