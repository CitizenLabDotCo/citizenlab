# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::DeliveryService do
  include ActiveJob::TestHelper

  describe '#send_now for an SMS campaign' do
    let(:campaign) { create(:sms_manual_campaign, body_multiloc: { 'en' => 'A short text message for you' }) }
    let!(:recipient) do
      user = create(:user, locale: 'en', phone_number: '+14155552671', phone_number_verified_at: Time.zone.now)
      create(:sms_consent, user: user, campaign_type: campaign.type, consented: true)
      user
    end

    it 'enqueues an Sms::SendJob carrying the campaign as source' do
      expect { described_class.new.send_now(campaign) }
        .to have_enqueued_job(Sms::SendJob)
        .with(
          to: '+14155552671',
          body: 'A short text message for you',
          user_id: recipient.id,
          source: campaign
        )
    end

    it 'writes an Sms::Delivery linked to the campaign when the job runs' do
      twilio = instance_double(Sms::Providers::Twilio, send: { message_sid: 'SM_1', status: 'queued' })
      allow(Sms::Providers::Twilio).to receive(:new).and_return(twilio)

      perform_enqueued_jobs { described_class.new.send_now(campaign) }

      delivery = Sms::Delivery.last
      expect(delivery.source).to eq(campaign)
      expect(delivery.user_id).to eq(recipient.id)
      expect(delivery.phone_number).to eq('+14155552671')
      expect(campaign.reload.sms_deliveries).to include(delivery)
    end
  end
end
