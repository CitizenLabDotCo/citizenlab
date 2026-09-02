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

  describe 'the segment limit' do
    let(:max_segments) { EmailCampaigns::Sms::SegmentedMessage::MAX_SEGMENTS }

    it 'accepts a body of exactly the maximum number of segments' do
      body = 'a' * (153 * max_segments)

      expect(build(:sms_manual_campaign, body_multiloc: { 'en' => body })).to be_valid
    end

    it 'rejects a body one character over' do
      campaign = build(:sms_manual_campaign, body_multiloc: { 'en' => 'a' * ((153 * max_segments) + 1) })

      expect(campaign).not_to be_valid
      expect(campaign.errors[:body_multiloc]).to be_present
    end

    # Each locale is a message of its own, so a short English body cannot excuse a long French one.
    it 'rejects a body that is only over the limit in one locale' do
      campaign = build(
        :sms_manual_campaign,
        body_multiloc: { 'en' => 'short', 'fr-FR' => 'a' * ((153 * max_segments) + 1) }
      )

      expect(campaign).not_to be_valid
      expect(campaign.errors[:body_multiloc].join).to include('fr-FR')
    end

    # Unicode fits 67 characters per segment, not 153.
    it 'measures the limit in segments rather than characters' do
      campaign = build(:sms_manual_campaign, body_multiloc: { 'en' => 'ж' * ((67 * max_segments) + 1) })

      expect(campaign).not_to be_valid
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

    include_context 'with sms manual campaigns feature enabled'

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
        expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued
          .with(delivery.id, use_case: EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)
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
        expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued
          .with(delivery.id, use_case: EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)
      end

      it 'raises when the previewer has no phone number' do
        recipient.update_columns(phone: nil, phone_confirmed_at: nil)
        expect { campaign.deliver_preview(command) }.to raise_error(EmailCampaigns::Sms::Error)
      end
    end
  end

  describe '#segments_for_send' do
    # 200 GSM-7 characters no longer fit the 160 a lone segment holds.
    let(:campaign) { create(:sms_manual_campaign, body_multiloc: { 'en' => 'short', 'fr-FR' => 'a' * 200 }) }

    before do
      %w[en en fr-FR].each do |locale|
        create(:consent, :sms_manual, user: create(:user, :with_confirmed_phone, locale: locale))
      end
    end

    it 'bills each recipient for the body in their own locale' do
      expect(campaign.segments_for_send).to eq 4
    end
  end

  describe 'the provider configuration guard' do
    include_context 'with sms manual campaigns feature enabled'

    let(:campaign) { create(:sms_manual_campaign) }

    before do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 10 })
      create(:consent, :sms_manual, user: create(:user, :with_confirmed_phone, locale: 'en'))
      campaign.previewer = create(:admin)
    end

    it 'refuses a send when the manual campaigns messaging service is not configured' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: {
        'twilio_manual_campaigns_messaging_service_sid' => ''
      })

      expect(campaign.valid?(:send)).to be false
      expect(campaign.errors.details[:base]).to include(error: :sms_not_configured)
    end

    it 'refuses a preview when the Twilio account credentials are missing' do
      SettingsService.new.activate_feature!('sms', settings: { 'twilio_auth_token' => '' })

      expect(campaign.valid?(:preview)).to be false
      expect(campaign.errors.details[:base]).to include(error: :sms_not_configured)
    end

    # Test mode never reaches Twilio, so the credentials it would need are beside the point.
    it 'allows a send in test mode without any Twilio credentials' do
      SettingsService.new.activate_feature!('sms', settings: {
        'use_test_mode' => true,
        'twilio_account_sid' => '',
        'twilio_auth_token' => ''
      })

      expect(campaign.valid?(:send)).to be true
    end
  end

  describe 'the balance guard on send' do
    include_context 'with sms manual campaigns feature enabled'

    let(:campaign) { create(:sms_manual_campaign, body_multiloc: { 'en' => 'a' * 200 }) }

    before { create(:consent, :sms_manual, user: create(:user, :with_confirmed_phone, locale: 'en')) }

    it 'refuses a send whose segments exceed the balance, even when the recipient count fits' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 1 })

      expect(campaign.valid?(:send)).to be false
      expect(campaign.errors.details[:base]).to include(error: :insufficient_sms_balance)
    end

    it 'allows a send the balance covers' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 2 })

      expect(campaign.valid?(:send)).to be true
    end
  end

  # A preview is a real, billed message, but only ever one, in the previewer's locale.
  describe 'the balance guard on a preview' do
    include_context 'with sms manual campaigns feature enabled'

    let(:campaign) do
      create(:sms_manual_campaign, body_multiloc: { 'en' => 'short', 'fr-FR' => 'a' * 200 })
    end

    before { campaign.previewer = create(:admin, :with_confirmed_phone, locale: 'fr-FR') }

    it 'refuses a preview whose segments exceed the balance' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 1 })

      expect(campaign.valid?(:preview)).to be false
      expect(campaign.errors.details[:base]).to include(error: :insufficient_sms_balance)
    end

    it 'allows a preview the balance covers' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 2 })

      expect(campaign.valid?(:preview)).to be true
    end

    # The whole audience is irrelevant: the preview only goes to the previewer.
    it 'ignores what a send to every recipient would cost' do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 2 })
      3.times { create(:consent, :sms_manual, user: create(:user, :with_confirmed_phone, locale: 'fr-FR')) }

      expect(campaign.valid?(:preview)).to be true
      expect(campaign.valid?(:send)).to be false
    end
  end

  # Without this the preview reaches the delivery layer with nowhere to send to, and raises.
  describe 'the phone number guard on a preview' do
    include_context 'with sms manual campaigns feature enabled'

    let(:campaign) { create(:sms_manual_campaign) }

    before do
      SettingsService.new.activate_feature!('sms_manual_campaigns', settings: { 'messages_purchased' => 10 })
    end

    it 'refuses a preview when the previewer has no confirmed phone number' do
      campaign.previewer = create(:admin)

      expect(campaign.valid?(:preview)).to be false
      expect(campaign.errors.details[:base]).to include(error: :no_previewer_phone)
    end

    it 'refuses a preview when there is no previewer at all' do
      expect(campaign.valid?(:preview)).to be false
      expect(campaign.errors.details[:base]).to include(error: :no_previewer_phone)
    end

    it 'allows a preview when the previewer confirmed a phone number' do
      campaign.previewer = create(:admin, :with_confirmed_phone)

      expect(campaign.valid?(:preview)).to be true
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:sms_manual_campaign) }

    it 'seeds recipients from opted-in users with a confirmed phone number and excludes others' do
      with_confirmed_phone = create(:user, :with_confirmed_phone)
      with_unconfirmed_phone = create(:user, phone: phone1, phone_confirmed_at: nil)
      without_phone = create(:user, phone: nil)
      [with_confirmed_phone, with_unconfirmed_phone, without_phone].each do |user|
        create(:consent, :sms_manual, user: user)
      end

      expect(campaign.apply_recipient_filters).to include(with_confirmed_phone)
      expect(campaign.apply_recipient_filters).not_to include(with_unconfirmed_phone)
      expect(campaign.apply_recipient_filters).not_to include(without_phone)
    end

    it 'filters out invitees' do
      invitee = create(:invited_user, phone: phone2, phone_confirmed_at: Time.zone.now)
      create(:consent, :sms_manual, user: invitee)

      expect(campaign.apply_recipient_filters).not_to include(invitee)
    end

    it 'only includes users who explicitly opted in to Manual SMS campaigns' do
      opted_in = create(:user, :with_confirmed_phone)
      create(:consent, :sms_manual, user: opted_in, consented: true)
      opted_out = create(:user, :with_confirmed_phone)
      create(:consent, :sms_manual, user: opted_out, consented: false)
      never_asked = create(:user, :with_confirmed_phone)

      recipients = campaign.apply_recipient_filters
      expect(recipients).to include(opted_in)
      expect(recipients).not_to include(opted_out)
      expect(recipients).not_to include(never_asked)
    end
  end
end
