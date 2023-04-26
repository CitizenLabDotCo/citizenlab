import React from 'react';
import { isUndefined } from 'lodash-es';
import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { ICampaignData, updateCampaign } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { Toggle } from '@citizenlab/cl2-component-library';
import {
  List as AutomatedEmailsList,
  Row,
  TextCell,
} from 'components/admin/ResourceList';
import Warning from 'components/UI/Warning';
import styled from 'styled-components';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledWarning = styled(Warning)`
  max-width: 600px;
  margin-bottom: 30px;
`;

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
      <StyledWarning
        text={<FormattedMessage {...messages.automatedEmailCampaignsInfo} />}
      />
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
                value={campaign.attributes.admin_campaign_description_multiloc}
              />
            </TextCell>
          </Row>
        ))}
      </AutomatedEmailsList>
    </>
  );
};

export default () => (
  <GetCampaigns withoutCampaignNames={['manual']} pageSize={250}>
    {(campaigns) => <AutomatedCampaigns {...campaigns} />}
  </GetCampaigns>
);
