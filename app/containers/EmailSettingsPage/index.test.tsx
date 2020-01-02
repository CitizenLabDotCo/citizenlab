import React from 'react';
import { shallow } from 'enzyme';

jest.mock('services/campaignConsents');
import { updateConsentByCampaignIDWIthToken } from 'services/campaignConsents';

jest.mock('components/ConsentForm', () => 'ConsentForm');
jest.mock('./InitialUnsubscribeFeedback', () => 'InitialUnsubscribeFeedback');

import { EmailSettingPage } from './';

// mock withRouter
const location = { query: { unsubscription_token: 'token', campaign_id: 'campaignId' } };

describe('<EmailSettingPage/>', () => {
  it('calls the update and initially renders the lodaing indicator', async () => {
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    expect(Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')).toBe('loading');
    expect(updateConsentByCampaignIDWIthToken).toHaveBeenCalledTimes(1);
    expect(updateConsentByCampaignIDWIthToken).toHaveBeenNthCalledWith(1, 'campaignId', false, 'token');
  });
  it('shows success indicator when initial update suceeds', async () => {
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    await updateConsentByCampaignIDWIthToken();
    Wrapper.update();
    expect(Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')).toBe('success');
  });
  it('shows error indicator when initial update fails', async () => {
    updateConsentByCampaignIDWIthToken.mockImplementationOnce(() => Promise.reject());
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    await updateConsentByCampaignIDWIthToken().catch(() => {
      Wrapper.update();

      expect(Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')).toBe('error');
    });
  });
});
