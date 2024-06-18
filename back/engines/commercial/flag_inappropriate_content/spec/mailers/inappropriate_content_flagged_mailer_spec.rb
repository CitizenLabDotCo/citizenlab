# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FlagInappropriateContent::EmailCampaigns::InappropriateContentFlaggedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { FlagInappropriateContent::EmailCampaigns::Campaigns::InappropriateContentFlagged.create! }
    let_it_be(:flaggable) { create(:idea) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          flaggable_type: flaggable.class.name,
          flag_automatically_detected: false,
          flaggable_author_name: UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(flaggable.author),
          flaggable_url: Frontend::UrlService.new.model_to_url(flaggable, locale: Locale.new(recipient.locale)),
          flaggable_title_multiloc: flaggable.title_multiloc,
          flaggable_body_multiloc: flaggable.body_multiloc
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to eq('A post on your platform has been flagged for review')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns post author name' do
      expect(mail.body.encoded).to match(flaggable.author.first_name)
    end

    it 'assigns review post CTA' do
      flaggable_url = command.dig(:event_payload, :flaggable_url)
      expect(mail.body.encoded).to match(flaggable_url)
    end

    it 'does not include the explanation note about automatic flagging' do
      expect(mail.body.encoded).not_to include('This post was automatically detected')
    end

    context 'when the flag was automatically detected' do
      before do
        command[:event_payload][:flag_automatically_detected] = true
      end

      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      it 'includes the explanation note about automatic flagging' do
        expect(mail.body.encoded).to include('This post was automatically detected')
      end
    end
  end
end
