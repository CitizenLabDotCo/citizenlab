# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectFolders::EmailCampaigns::ProjectFolderModerationRightsReceivedMailer do
  describe 'campaign_mail' do
    let(:project_folder) { create(:project_folder) }
    let!(:recipient) { create(:project_folder_moderator, locale: 'en', project_folders: [project_folder]) }
    let!(:campaign) { EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_folder_id: project_folder.id,
          project_folder_title_multiloc: project_folder.title_multiloc,
          project_folder_projects_count: project_folder.projects.count,
          project_folder_url: 'https://admin.folder.url'
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

    it 'assigns the message box title (title_what_can_you_do_folderadmin)' do
      title = I18n.t('email_campaigns.project_folder_moderation_rights_received.title_what_can_you_do_folderadmin')
      expect(mail.body.encoded).to match(title)
    end

    it 'assigns moderate CTA' do
      expect(mail.body.encoded).to match('https://admin.folder.url')
    end
  end
end
