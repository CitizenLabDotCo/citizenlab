// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import { updateConsentByCampaignIDWithToken } from 'services/campaignConsents';
import { EmailSettingPage } from './';

jest.mock('services/campaignConsents');

jest.mock('components/ConsentForm', () => 'ConsentForm');
jest.mock('./InitialUnsubscribeFeedback', () => 'InitialUnsubscribeFeedback');
jest.mock('modules', () => ({ streamsToReset: [] }));

// mock withRouter
const location = {
  query: { unsubscription_token: 'token', campaign_id: 'campaignId' },
};

describe('<EmailSettingPage/>', () => {
  it('calls the update and initially renders the lodaing indicator', async () => {
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    expect(
      Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')
    ).toBe('loading');
    expect(updateConsentByCampaignIDWithToken).toHaveBeenCalledTimes(1);
    expect(updateConsentByCampaignIDWithToken).toHaveBeenNthCalledWith(
      1,
      'campaignId',
      false,
      'token'
    );
  });
  it('shows success indicator when initial update suceeds', async () => {
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    await updateConsentByCampaignIDWithToken();
    Wrapper.update();
    expect(
      Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')
    ).toBe('success');
  });
  it('shows error indicator when initial update fails', async () => {
    updateConsentByCampaignIDWithToken.mockImplementationOnce(() =>
      Promise.reject()
    );
    const Wrapper = shallow(<EmailSettingPage location={location} />);
    await updateConsentByCampaignIDWithToken().catch(() => {
      Wrapper.update();

      expect(
        Wrapper.find('EmailSettingsPage__StyledInitialFeedback').prop('status')
      ).toBe('error');
    });
  });
});
