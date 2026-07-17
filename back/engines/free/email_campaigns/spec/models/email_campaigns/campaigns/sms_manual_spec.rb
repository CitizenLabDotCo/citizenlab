# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::SmsManual do
  let(:phone1) { '+14155552671' }
  let(:phone2) { '+14155552672' }

  describe 'SmsManual default factory' do
    it 'is valid' do
      expect(build(:sms_manual_campaign)).to be_valid
    end

    it 'is invalid without a body' do
      expect(build(:sms_manual_campaign, body_multiloc: {})).not_to be_valid
    end

    it 'is invalid without a subject' do
      expect(build(:sms_manual_campaign, subject_multiloc: {})).not_to be_valid
    end
  end

  describe 'channel and manual flags' do
    subject(:campaign) { build(:sms_manual_campaign) }

    it { expect(campaign.channel).to eq('sms') }
    it { expect(campaign.manual?).to be(true) }
    it { expect(campaign.can_be_disabled?).to be(false) }

    it 'persists the sms channel' do
      campaign.save!
      expect(campaign.reload.channel).to eq('sms')
    end
  end

  describe '#sent?' do
    let(:campaign) { create(:sms_manual_campaign) }

    it 'is false with no deliveries and true once an EmailCampaigns::Sms::Delivery is linked' do
      expect(campaign.sent?).to be(false)
      EmailCampaigns::Sms::Delivery.create!(campaign: campaign, body: 'hi', status: 'pending')
      expect(campaign.sent?).to be(true)
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:recipient) { create(:user) }

    it 'generates a command with only the SMS payload (no subject/sender)' do
      expect(campaign.generate_commands(recipient: recipient)&.first).to match({
        author: campaign.author,
        event_payload: {},
        body_multiloc: campaign.body_multiloc
      })
    end
  end

  describe '#sms_body' do
    let(:campaign) { build(:sms_manual_campaign) }
    let(:recipient) { create(:user, locale: 'en') }

    it 'renders the command body_multiloc in the recipient locale' do
      command = { recipient: recipient, body_multiloc: { 'en' => 'A short SMS update from your city.' } }
      expect(campaign.sms_body(command)).to eq('A short SMS update from your city.')
    end
  end

  describe '#sms_destination' do
    let(:campaign) { build(:sms_manual_campaign) }
    let(:recipient) { create(:user, phone: phone1, phone_confirmed_at: Time.zone.now) }

    it 'targets the recipient confirmed phone' do
      expect(campaign.sms_destination({ recipient: recipient })).to eq(phone1)
    end
  end

  describe 'async SMS delivery' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:recipient) { create(:user, locale: 'en', phone: phone1, phone_confirmed_at: Time.zone.now) }
    let(:command) { { recipient: recipient, body_multiloc: { 'en' => 'A short SMS update from your city.' } } }

    include_context 'with sms feature enabled'

    describe '#deliver_later' do
      it 'creates a campaign-linked pending delivery and enqueues a SendJob' do
        delivery = nil
        expect { delivery = campaign.deliver_later(command) }
          .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

        expect(delivery).to have_attributes(
          user_id: recipient.id,
          campaign_id: campaign.id,
          body: 'A short SMS update from your city.',
          status: 'pending'
        )
        expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
      end

      it 'is a no-op when the recipient has no phone number' do
        recipient.update_columns(phone: nil, phone_confirmed_at: nil)
        expect { campaign.deliver_later(command) }.not_to change(EmailCampaigns::Sms::Delivery, :count)
      end
    end

    describe '#deliver_preview' do
      it 'creates and enqueues the delivery, unlinked from the campaign' do
        delivery = nil
        expect { delivery = campaign.deliver_preview(command) }
          .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

        expect(delivery.campaign_id).to be_nil
        expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
      end

      it 'raises when the previewer has no phone number' do
        recipient.update_columns(phone: nil, phone_confirmed_at: nil)
        expect { campaign.deliver_preview(command) }.to raise_error(EmailCampaigns::Sms::Error)
      end
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:sms_manual_campaign) }
    let(:sms_campaign_type) { 'EmailCampaigns::Campaigns::SmsManual' }

    def opt_in(user)
      create(:consent, user: user, campaign_type: sms_campaign_type, consented: true)
    end

    it 'seeds recipients from opted-in users with a confirmed phone number and excludes others' do
      with_confirmed_phone = create(:user, :with_confirmed_phone)
      with_unconfirmed_phone = create(:user, phone: phone1, phone_confirmed_at: nil)
      without_phone = create(:user, phone: nil)
      [with_confirmed_phone, with_unconfirmed_phone, without_phone].each { |user| opt_in(user) }

      expect(campaign.apply_recipient_filters).to include(with_confirmed_phone)
      expect(campaign.apply_recipient_filters).not_to include(with_unconfirmed_phone)
      expect(campaign.apply_recipient_filters).not_to include(without_phone)
    end

    it 'filters out invitees' do
      invitee = create(:invited_user, phone: phone2, phone_confirmed_at: Time.zone.now)
      opt_in(invitee)

      expect(campaign.apply_recipient_filters).not_to include(invitee)
    end

    it 'only includes users who explicitly opted in to marketing SMS' do
      opted_in = create(:user, :with_confirmed_phone)
      create(:consent, user: opted_in, campaign_type: sms_campaign_type, consented: true)
      opted_out = create(:user, :with_confirmed_phone)
      create(:consent, user: opted_out, campaign_type: sms_campaign_type, consented: false)
      never_asked = create(:user, :with_confirmed_phone)

      recipients = campaign.apply_recipient_filters
      expect(recipients).to include(opted_in)
      expect(recipients).not_to include(opted_out)
      expect(recipients).not_to include(never_asked)
    end
  end
end
