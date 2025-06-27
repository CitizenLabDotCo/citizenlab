# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingPhaseStartedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::VotingPhaseStarted.create! }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
          project_title_multiloc: project.title_multiloc,
          phase_title_multiloc: project.phases.first.title_multiloc,
          ideas: [
            {
              title_multiloc: {
                'en' => 'An idea title'
              },
              url: 'http://localhost:3000/en/ideas/an-idea',
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
            },
            {
              title_multiloc: {
                'en' => 'Another idea title'
              },
              url: 'http://localhost:3000/en/ideas/another-idea',
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

    it 'renders the subject including project title' do
      expect(mail.subject).to match 'The voting phase started'
      expect(mail.subject).to match project.title_multiloc['en']
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'displays the correct body - including project title and number of options' do
      expect(body).to match 'asking you to vote between'
      expect(body).to match project.title_multiloc['en']
      expect(body).to match '2 options' # number of ideas passed to the email
    end

    it 'lists the ideas for the phase in the body' do
      expect(body).to match('An idea title')
      expect(body).to match('Another idea title')
      expect(body).to match('ideas/an-idea')
      expect(body).to match('uploads/small_image.jpeg')
    end

    it "displays 'Go to the platform to vote' button with correct link" do
      project_url = Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale))
      expect(body).to match project_url
      expect(body).to match 'Go to the platform to vote'
    end
  end
end
