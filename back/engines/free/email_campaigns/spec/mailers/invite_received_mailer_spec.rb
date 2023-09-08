# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::InviteReceivedMailer do
  describe 'InviteReceived' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::InviteReceived.create! }
    let_it_be(:token) { Invites::Service.new.generate_token }
    let_it_be(:inviter) { create(:admin) }
    let_it_be(:invite_text) { 'Would you like to join our awesome platform?' }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          inviter_first_name: inviter.first_name,
          inviter_last_name: inviter.last_name,
          invitee_first_name: recipient.first_name,
          invitee_last_name: recipient.last_name,
          invite_text: "<p>#{invite_text}</p>",
          activate_invite_url: Frontend::UrlService.new.invite_url(token, locale: recipient.locale)
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('You are invited to')
    end

    it 'renders the expiry message' do
      expiry_days = described_class.new.send(:invite_expiry_days)

      expect(mail.body.encoded)
        .to match("This invitation expires in #{expiry_days} days")
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'assigns invite url' do
      expect(mail.body.encoded)
        .to include(command[:event_payload][:activate_invite_url])
    end

    it 'assigns invite text' do
      expect(mail.body.encoded)
        .to match(invite_text)
    end
  end
end
