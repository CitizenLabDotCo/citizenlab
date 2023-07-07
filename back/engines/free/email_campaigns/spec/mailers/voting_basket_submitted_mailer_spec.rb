# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingBasketSubmittedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::VotingBasketSubmitted.create! }
    let_it_be(:project) { create(:project) }

    # TODO: Can we make this command generate from a local basket
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale),
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

    it 'says you voted successfully' do
      expect(mail.body.encoded).to match('You voted successfully')
    end

    it 'says votes have been recorded' do
      expect(mail.body.encoded).to match('Thanks for participating. Your votes have been recorded.')
    end

    it 'lists the ideas you voted for' do
      expect(mail.body.encoded).to match('A voted idea title')
      expect(mail.body.encoded).to match('ideas/a-voted-idea')
      expect(mail.body.encoded).to match('uploads/small_image.jpeg')
    end

    it 'assigns see votes submitted CTA' do
      project_url = Frontend::UrlService.new.model_to_url(project, locale: recipient.locale)
      expect(mail.body.encoded).to match(project_url)
      expect(mail.body.encoded).to match('Click the button below to participate')
    end
  end
end
