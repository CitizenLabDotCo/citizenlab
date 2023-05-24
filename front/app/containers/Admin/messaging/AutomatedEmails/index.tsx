import React from 'react';
import { isUndefined } from 'lodash-es';
import { ICampaignData } from 'services/campaigns';
import T from 'components/T';
import { Toggle, Box, Text, Title } from '@citizenlab/cl2-component-library';
import {
  List as AutomatedEmailsList,
  Row,
  TextCell,
} from 'components/admin/ResourceList';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import useCampaigns from 'api/campaigns/useCampaigns';

const AutomatedEmails = () => {
  const { data: campaigns } = useCampaigns({
    withoutCampaignNames: ['manual'],
    pageSize: 250,
  });
  const { mutate: updateCampaign } = useUpdateCampaign();

  if (!campaigns) return null;

  const handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign({
      id: campaign.id,
      campaign: {
        enabled: !campaign.attributes.enabled,
      },
    });
  };

  return (
    <>
      <Box mb="28px">
        <Title color="primary">
          <FormattedMessage {...messages.automatedEmails} />
        </Title>
        <Text color="coolGrey600">
          <FormattedMessage {...messages.automatedEmailCampaignsInfo} />
        </Text>
      </Box>
      <Box background={colors.white} p="40px">
        <AutomatedEmailsList>
          {campaigns.data.map((campaign) => (
            <Row key={campaign.id}>
              <Toggle
                disabled={isUndefined(campaign.attributes.enabled)}
                checked={
                  isUndefined(campaign.attributes.enabled) ||
                  campaign.attributes.enabled
                }
                onChange={handleOnEnabledToggle(campaign)}
              />
              <TextCell className="expand">
                <T
                  value={
                    campaign.attributes.admin_campaign_description_multiloc
                  }
                />
              </TextCell>
            </Row>
          ))}
        </AutomatedEmailsList>
      </Box>
    </>
  );
};

export default AutomatedEmails;
