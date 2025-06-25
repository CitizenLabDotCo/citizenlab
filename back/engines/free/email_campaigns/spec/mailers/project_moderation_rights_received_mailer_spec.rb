# frozen_string_literal: true

require 'rails_helper'
require_relative 'shared_examples_for_campaign_delivery_tracking'

RSpec.describe EmailCampaigns::ProjectModerationRightsReceivedMailer do
  describe 'campaign_mail' do
    let_it_be(:project) { create(:project) }
    let_it_be(:recipient) { create(:project_moderator, locale: 'en', projects: [project]) }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ProjectModerationRightsReceived.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_id: project.id,
          project_title_multiloc: project.title_multiloc,
          project_ideas_count: project.ideas_count,
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale))
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('You became a project manager on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the message box title (title_what_can_you_do_moderator)' do
      expect(mail.body.encoded).to match('What can you do as a project manager?')
    end

    it 'assigns moderate CTA' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.admin_project_url(project.id))
    end
  end
end
