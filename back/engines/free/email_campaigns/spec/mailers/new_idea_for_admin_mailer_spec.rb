# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewIdeaForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewIdeaForAdmin.create! }

    describe 'when the input if published' do
      let_it_be(:input) { create(:idea, publication_status: 'published', author: recipient) }
      let_it_be(:command) do
        {
          recipient: recipient,
          event_payload: {
            post_submitted_at: input.submitted_at&.iso8601,
            post_published_at: input.published_at&.iso8601,
            post_title_multiloc: input.title_multiloc,
            post_author_name: input.author_name,
            post_url: Frontend::UrlService.new.model_to_url(input, locale: Locale.new(recipient.locale))
          }
        }
      end
      let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      it 'renders the subject' do
        expect(mail.subject).to start_with('A new post has been published on')
      end

      it 'renders the receiver email' do
        expect(mail.to).to eq([recipient.email])
      end

      it 'renders the sender email' do
        expect(mail.from).to all(end_with('@citizenlab.co'))
      end

      it 'assigns author name' do
        expect(mail.body.encoded).to match(input.author_name)
      end

      it 'assigns go to input CTA' do
        input_url = Frontend::UrlService.new.model_to_url(input, locale: Locale.new(recipient.locale))
        expect(mail.body.encoded).to match(input_url)
      end
    end

    describe 'when the input is in prescreening' do
      let_it_be(:input) { create(:proposal, publication_status: 'submitted', idea_status: create(:proposals_status, code: 'prescreening'), author: recipient) }
      let_it_be(:command) do
        {
          recipient: recipient,
          event_payload: {
            post_submitted_at: input.submitted_at&.iso8601,
            post_published_at: input.published_at&.iso8601,
            post_title_multiloc: input.title_multiloc,
            post_author_name: input.author_name,
            post_url: Frontend::UrlService.new.model_to_url(input, locale: Locale.new(recipient.locale))
          }
        }
      end
      let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      it 'renders the subject' do
        expect(mail.subject).to start_with('A new post has been published on')
      end

      it 'renders the receiver email' do
        expect(mail.to).to eq([recipient.email])
      end
    end
  end
end
