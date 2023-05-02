# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPhaseStartedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ProjectPhaseStarted.create! }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:phase) { project.phases.first }
    let_it_be(:notification) { create(:project_phase_started, recipient: recipient, project: project, phase: phase) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: notification.phase.title_multiloc,
          phase_description_multiloc: notification.phase.description_multiloc,
          phase_start_at: notification.phase.start_at.iso8601,
          phase_end_at: notification.phase.end_at.iso8601,
          phase_url: Frontend::UrlService.new.model_to_url(notification.phase, locale: recipient.locale),
          project_title_multiloc: notification.project.title_multiloc,
          project_description_preview_multiloc: notification.project.description_preview_multiloc
        },
        delay: 8.hours.to_i
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to end_with('entered a new phase')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :phase_url))
    end
  end
end
