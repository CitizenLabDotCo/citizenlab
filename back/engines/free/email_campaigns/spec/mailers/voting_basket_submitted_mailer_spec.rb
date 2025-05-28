# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingBasketSubmittedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::VotingBasketSubmitted.create! }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
          voted_ideas: [
            {
              title_multiloc: {
                'en' => 'A voted idea title'
              },
              url: 'http://localhost:3000/en/ideas/a-voted-idea',
              images: [
                {
                  versions: {
                    small: 'http://localhost:4000/uploads/small_image.jpeg',
                    medium: 'http://localhost:4000/uploads/medium_image.jpeg',
                    large: 'http://localhost:4000/uploads/large_image.jpeg',
                    fb: 'http://localhost:4000/uploads/fb_image.jpeg'
                  }
                }
              ]
            }
          ]
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to end_with('You voted successfully')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it "displays 'says you voted successfully' in the body" do
      expect(body).to match 'You voted successfully'
    end

    it "displays 'votes have been recorded' in the body" do
      expect(body).to match('Thanks for participating. Your votes have been recorded.')
    end

    it 'lists the ideas you voted for in the body' do
      expect(body).to match('A voted idea title')
      expect(body).to match('ideas/a-voted-idea')
      expect(body).to match('uploads/small_image.jpeg')
    end

    it "displays 'See votes submitted' button with correct link" do
      project_url = Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale))
      expect(body).to match(project_url)
      expect(body).to match('Click the button below to participate')
      expect(body).to match 'See votes submitted'
    end
  end
end
