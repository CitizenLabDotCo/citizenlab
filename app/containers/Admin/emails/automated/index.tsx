import React from 'react';
import { isUndefined } from 'lodash-es';
import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { ICampaignData, updateCampaign } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { Toggle } from 'cl2-component-library';
import {
  List as AutomatedEmailsList,
  Row,
  TextCell,
} from 'components/admin/ResourceList';
import Warning from 'components/UI/Warning';
import styled from 'styled-components';
// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

const StyledWarning = styled(Warning)`
  max-width: 600px;
  margin-bottom: 30px;
`;

type DataProps = GetCampaignsChildProps & {};

type Props = DataProps & {};

class AutomatedCampaigns extends React.PureComponent<
  Props & InjectedIntlProps
> {
  handleOnEnabledToggle = (campaign: ICampaignData) => () => {
    updateCampaign(campaign.id, {
      enabled: !campaign.attributes.enabled,
    });
  };

  render() {
    const { campaigns } = this.props;

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
                onChange={this.handleOnEnabledToggle(campaign)}
              />
              <TextCell className="expand">
                <T
                  value={
                    campaign.attributes.admin_campaign_description_multiloc
                  }
                />
              </TextCell>
              {/* <div>
                <T value={campaign.attributes.schedule_multiloc} />
              </div> */}
            </Row>
          ))}
        </AutomatedEmailsList>
      </>
    );
  }
}

const AutomatedCampaignsWithIntl = injectIntl<Props>(AutomatedCampaigns);

export default (inputProps: Props) => (
  <GetCampaigns withoutCampaignNames={['manual']} pageSize={250}>
    {(campaigns) => (
      <AutomatedCampaignsWithIntl {...inputProps} {...campaigns} />
    )}
  </GetCampaigns>
);
