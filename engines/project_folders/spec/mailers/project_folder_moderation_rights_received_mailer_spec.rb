require 'rails_helper'

RSpec.describe ProjectFolders::EmailCampaigns::ProjectFolderModerationRightsReceivedMailer, type: :mailer do
  describe 'campaign_mail' do
    let(:project_folder) { create(:project_folder) }
    let!(:recipient) { create(:project_folder_moderator, locale: 'en', project_folder: project_folder) }
    let!(:campaign) { ProjectFolders::EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_folder_id: project_folder.id,
          project_folder_title_multiloc: project_folder.title_multiloc,
          project_folder_projects_count: project_folder.projects.count,
          project_folder_url: Frontend::UrlService.new.admin_project_folder_url(project_folder.id, locale: recipient.locale)
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to start_with('You became a project folder manager')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the message box title (title_what_can_you_do_moderator)' do
      expect(mail.body.encoded).to I18n.t('email_campaigns.project_moderation_rights_received.title_what_can_you_do_moderator')
    end

    it 'assigns moderate CTA' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.admin_project_folder_url(project_folder.id, locale: recipient.locale))
    end
  end
end
