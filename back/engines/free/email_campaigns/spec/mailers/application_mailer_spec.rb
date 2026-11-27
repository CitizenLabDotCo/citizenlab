# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ApplicationMailer do
  let_it_be(:recipient) { create(:user, locale: 'en') }

  # Any concrete campaign mailer exercises the shared behaviour.
  let(:campaign) { create(:welcome_campaign) }
  let(:command) { { recipient: recipient } }
  let(:mail) { EmailCampaigns::WelcomeMailer.with(command: command, campaign: campaign).campaign_mail }

  describe 'tracking headers' do
    it 'sets the tenant id header' do
      expect(mail[described_class::TENANT_ID_HEADER].value).to eq AppConfiguration.instance.id
    end

    it 'omits the delivery id header when the command has no delivery id' do
      expect(mail[described_class::DELIVERY_ID_HEADER]).to be_nil
    end

    it 'sets the delivery id header from the command' do
      command[:delivery_id] = 'delivery-uuid'
      expect(mail[described_class::DELIVERY_ID_HEADER].value).to eq 'delivery-uuid'
    end
  end
end
