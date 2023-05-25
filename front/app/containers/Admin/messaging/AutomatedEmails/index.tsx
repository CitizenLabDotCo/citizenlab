import React, { useState, useEffect } from 'react';
import { isUndefined } from 'lodash-es';
import { ICampaignData } from 'api/campaigns/types';
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

const groupBy = (key: string) => (result, current) => {
  const resultObj = Object.fromEntries(result);
  const groupingKey = current[key];
  if (!resultObj[groupingKey]) {
    resultObj[groupingKey] = [];
  }
  resultObj[groupingKey].push(current);
  return Object.entries(resultObj);
};

const sortBy = (key: string) => (a, b) => {
  const numA = a[1][0].attributes[`${key}_ordering`];
  const numB = b[1][0].attributes[`${key}_ordering`];
  return numA - numB;
};

const AutomatedEmails = () => {
  const { data: campaigns } = useCampaigns({
    withoutCampaignNames: ['manual'],
    pageSize: 250,
  });
  const { mutate: updateCampaign } = useUpdateCampaign();
  const localize = useLocalize();
  const [groupedCampaigns, setGroupedCampaigns] = useState<any[]>([]);

  const handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign({
      id: campaign.id,
      campaign: {
        enabled: !campaign.attributes.enabled,
      },
    });
  };

  useEffect(() => {
    if (campaigns?.pages) {
      setGroupedCampaigns(
        campaigns.pages
          .map((page) => page.data)
          .flat()
          .map(
            ({
              attributes: {
                content_type_multiloc,
                recipient_role_multiloc,
                recipient_segment_multiloc,
                trigger_multiloc,
                campaign_description_multiloc,
                schedule_multiloc,
                ...attributes
              },
              ...campaign
            }) => ({
              content_type: localize(content_type_multiloc),
              recipient_role: localize(recipient_role_multiloc),
              recipient_segment: localize(recipient_segment_multiloc),
              trigger: trigger_multiloc && localize(trigger_multiloc),
              campaign_description: localize(campaign_description_multiloc),
              schedule: schedule_multiloc && localize(schedule_multiloc),
              ...{
                attributes: { ...attributes },
                ...campaign,
              },
            })
          )
          .reduce(groupBy('recipient_role'), [])
          .sort(sortBy('recipient_role'))
          .map(([recipient_role, group]) => [
            recipient_role,
            group
              .reduce(groupBy('content_type'), [])
              .sort(sortBy('content_type')),
          ])
      );
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
                          {campaign.campaign_description}
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
