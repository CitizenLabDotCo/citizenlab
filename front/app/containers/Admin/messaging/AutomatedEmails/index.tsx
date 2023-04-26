import React from 'react';
import { isUndefined } from 'lodash-es';
import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { ICampaignData, updateCampaign } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
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

type Props = GetCampaignsChildProps;

const AutomatedCampaigns = ({ campaigns }: Props) => {
  const handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign(campaign.id, {
      enabled: !campaign.attributes.enabled,
    });
  };

  if (isNilOrError(campaigns)) return null;

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
          {campaigns.map((campaign) => (
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

export default () => (
  <GetCampaigns withoutCampaignNames={['manual']} pageSize={250}>
    {(campaigns) => <AutomatedCampaigns {...campaigns} />}
  </GetCampaigns>
);
