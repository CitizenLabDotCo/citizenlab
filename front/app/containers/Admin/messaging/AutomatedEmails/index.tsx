import React, { useState, useEffect } from 'react';
import { isUndefined } from 'lodash-es';
import { flow, map, groupBy, entries, sortBy } from 'lodash/fp';
import { ICampaignData } from 'services/campaigns';
import {
  Toggle,
  Box,
  Text,
  Title,
  Icon,
  ListItem,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import useCampaigns from 'api/campaigns/useCampaigns';
import useLocalize from 'hooks/useLocalize';

const AutomatedEmails = () => {
  const { data: { data: campaigns } = {} } = useCampaigns({
    withoutCampaignNames: ['manual'],
    pageSize: 250,
  });
  const { mutate: updateCampaign } = useUpdateCampaign();
  const localize = useLocalize();
  const [groupedCampaigns, setGroupedCampaigns] = useState([]);

  const handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign({
      id: campaign.id,
      campaign: {
        enabled: !campaign.attributes.enabled,
      },
    });
  };

  useEffect(() => {
    const groupCampaigns = flow([
      map((campaign: any) => ({
        content_type: localize(campaign.attributes.content_type_multiloc),
        recipient_role: localize(campaign.attributes.recipient_role_multiloc),
        recipient_segment: localize(
          campaign.attributes.recipient_segment_multiloc
        ),
        trigger:
          campaign.attributes.trigger_multiloc &&
          localize(campaign.attributes.trigger_multiloc),
        admin_campaign_description: localize(
          campaign.attributes.admin_campaign_description_multiloc
        ),
        schedule:
          campaign.attributes.schedule_multiloc &&
          localize(campaign.attributes.schedule_multiloc),
        ...campaign,
      })),
      groupBy('recipient_role'),
      entries,
      sortBy((g: any) => g[1][0].attributes.recipient_role_ordering),
      map(([recipient_role, group]) => [
        recipient_role,
        flow([
          groupBy('content_type'),
          entries,
          sortBy((g: any) => g[1][0].attributes.content_type_ordering),
        ])(group),
      ]),
    ]);

    if (campaigns) {
      setGroupedCampaigns(groupCampaigns(campaigns));
    }
  }, [campaigns, localize]);

  if (!campaigns) return null;

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
      <Box background={colors.white} p="20px 40px">
        {groupedCampaigns.map(([recipient_role, group]: [string, any], i) => (
          <Box key={i} mb="30px">
            <Title color="primary" variant="h3" mt="20px">
              {recipient_role}
            </Title>
            {group.map(([content_type, campaigns]: [string, any[]], ii) => (
              <Box key={ii}>
                <Title color="primary" variant="h4">
                  {content_type}
                </Title>
                {campaigns.map((campaign) => (
                  <ListItem key={campaign.id} p="10px 0">
                    <Box display="flex" alignItems="center">
                      <Toggle
                        disabled={isUndefined(campaign.attributes.enabled)}
                        checked={
                          isUndefined(campaign.attributes.enabled) ||
                          campaign.attributes.enabled
                        }
                        onChange={handleOnEnabledToggle(campaign)}
                      />
                      <Box display="flex" flexDirection="column" ml="20px">
                        <Text color="grey800" m="0">
                          {campaign.admin_campaign_description}
                        </Text>
                        <Box display="flex">
                          <Box display="flex" justifyContent="center">
                            <Icon
                              name="user"
                              fill={colors.coolGrey600}
                              width={`${fontSizes.m}px`}
                              m="-2px 5px 0 0"
                            />
                            <Text m="0" color="coolGrey600" fontSize="s">
                              {campaign.recipient_segment}
                            </Text>
                          </Box>
                          <Box ml="5px">·</Box>
                          <Box display="flex" justifyContent="center" ml="5px">
                            <Icon
                              name="clock"
                              fill={colors.coolGrey600}
                              width={`${fontSizes.m}px`}
                              m="-2px 5px 0 0"
                            />
                            <Text m="0" color="coolGrey600" fontSize="s">
                              {campaign.trigger || campaign.schedule}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default AutomatedEmails;
