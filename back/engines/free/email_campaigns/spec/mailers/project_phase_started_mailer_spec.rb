# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPhaseStartedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:phase) { project.phases.first }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ProjectPhaseStarted.create! }
    let_it_be(:notification) { create(:project_phase_started, recipient: recipient, project: project, phase: phase) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:project_phase_started_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

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

    it 'includes the project title' do
      expect(mail.body.encoded).to match(project.title_multiloc['en'])
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: project, user: recipient)))
    end
  end
end
