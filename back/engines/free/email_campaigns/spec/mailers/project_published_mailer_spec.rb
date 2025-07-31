# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPublishedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ProjectPublished.create! }
    let_it_be(:project) { create(:project) }
    let_it_be(:command) do
      activity = create(:activity, item: project, action: 'published')
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('A new project was published on')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      project_url = command.dig(:event_payload, :project_url)
      expect(project_url).to be_present
      expect(project_url).to match('http://example.org')
      expect(mail.body.encoded).to match(project_url)
    end

    it 'includes the project title' do
      expect(mail.body.encoded).to match(project.title_multiloc['en'])
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(user: recipient)))
    end
  end
end
