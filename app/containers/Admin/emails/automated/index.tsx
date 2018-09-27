import React from 'react';
import { isUndefined } from 'lodash-es';
import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { ICampaignData, updateCampaign } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';

import Toggle from 'components/UI/Toggle';
import { List, Row, TextCell } from 'components/admin/ResourceList';

type DataProps = GetCampaignsChildProps & {

};

type Props = DataProps & {

};

class AutomatedCampaigns extends React.PureComponent<Props> {

  handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign(campaign.id, {
      enabled: !campaign.attributes.enabled,
    });
  }

  render() {
    const { campaigns } = this.props;

    if (isNilOrError(campaigns)) return null;

    return (
      <List>
        {campaigns.map((campaign) => (
          <Row key={campaign.id}>
            <Toggle
              disabled={isUndefined(campaign.attributes.enabled)}
              value={isUndefined(campaign.attributes.enabled) || campaign.attributes.enabled}
              onChange={this.handleOnEnabledToggle(campaign)}
            />
            <TextCell className="expand">
              <T value={campaign.attributes.campaign_description_multiloc} />
            </TextCell>
            <div>
              <T value={campaign.attributes.schedule_multiloc} />
            </div>
          </Row>
        ))}
      </List>
    );
  }
}

export default (inputProps: Props) => (
  <GetCampaigns withoutCampaignNames={['manual']} pageSize={250}>
    {campaigns => <AutomatedCampaigns {...inputProps} {...campaigns} />}
  </GetCampaigns>
);
