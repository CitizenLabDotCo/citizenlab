# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::AssureCampaignsService do
  subject(:service) { described_class.new }

  describe '#remove_deprecated_campaigns' do
    # A type that no longer exists in the codebase, which is the only thing this task
    # is meant to clean up. Set past validation/STI, the way a removed class leaves it.
    def deprecate!(campaign)
      campaign.update_column(:type, 'EmailCampaigns::Campaigns::NoLongerExists')
      campaign
    end

    it 'removes campaigns whose type no longer exists in the codebase' do
      deprecated = deprecate!(create(:manual_campaign))
      kept = create(:manual_campaign)

      service.remove_deprecated_campaigns

      expect(EmailCampaigns::Campaign.exists?(deprecated.id)).to be false
      expect(EmailCampaigns::Campaign.exists?(kept.id)).to be true
    end

    it 'removes the campaign groups and email deliveries of a deprecated campaign' do
      campaign = create(:manual_campaign)
      campaigns_group = create(:campaigns_group, campaign: campaign)
      delivery = create(:delivery, campaign: campaign)
      deprecate!(campaign)

      service.remove_deprecated_campaigns

      expect(EmailCampaigns::CampaignsGroup.exists?(campaigns_group.id)).to be false
      expect(EmailCampaigns::Delivery.exists?(delivery.id)).to be false
    end

    context 'when the sms feature is enabled' do
      include_context 'with sms feature enabled'

      it 'unlinks (but keeps) the sms deliveries of a deprecated campaign' do
        campaign = create(:sms_manual_campaign)
        delivery = create(:sms_delivery, campaign: campaign)
        deprecate!(campaign)

        service.remove_deprecated_campaigns

        expect(EmailCampaigns::Campaign.exists?(campaign.id)).to be false
        expect(delivery.reload.campaign_id).to be_nil
      end

      it 'keeps sms campaigns that are still supported' do
        campaign = create(:sms_manual_campaign)

        service.remove_deprecated_campaigns

        expect(EmailCampaigns::Campaign.exists?(campaign.id)).to be true
      end
    end

    # A campaign whose feature is switched off is dormant, not deprecated. Deleting it
    # would destroy admin-authored content, and (for sms) trip the foreign key from
    # sms_deliveries.
    context 'when a feature is deactivated after its campaigns were created' do
      it 'keeps the sms campaigns and their deliveries' do
        SettingsService.new.activate_feature!('sms', settings: {
          'twilio_account_sid' => 'AC_test',
          'twilio_auth_token' => 'token',
          'twilio_messaging_service_sid' => 'MG_test'
        })
        campaign = create(:sms_manual_campaign)
        delivery = create(:sms_delivery, campaign: campaign)
        SettingsService.new.deactivate_feature!('sms')

        expect { service.remove_deprecated_campaigns }.not_to raise_error

        expect(EmailCampaigns::Campaign.exists?(campaign.id)).to be true
        expect(delivery.reload.campaign_id).to eq campaign.id
      end

      it 'keeps the community monitor report campaign' do
        SettingsService.new.activate_feature!('community_monitor')
        campaign = create(:community_monitor_report_campaign)
        SettingsService.new.deactivate_feature!('community_monitor')

        service.remove_deprecated_campaigns

        expect(EmailCampaigns::Campaign.exists?(campaign.id)).to be true
      end
    end
  end
end
