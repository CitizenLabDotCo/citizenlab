require 'rails_helper'

RSpec.describe EmailCampaigns::InviteReminderMailer, type: :mailer do
  describe 'InviteReminder' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::InviteReminder.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:token) { InvitesService.new.generate_token }
    let(:inviter) { create(:admin) }
    let(:invite_text) { 'Would you like to join our awesome platform?' }
    let(:command) do
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

    it 'renders the subject' do
      expect(mail.subject).to start_with('Pending invitation for the participation platform')
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
  end
end
