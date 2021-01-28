require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectModerationRightsReceivedMailer, type: :mailer do
  describe 'campaign_mail' do
    let(:project) { create(:project) }
    let!(:recipient) { create(:moderator, locale: 'en', project: project) }
    let!(:campaign) { EmailCampaigns::Campaigns::ProjectModerationRightsReceived.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_id: project.id,
          project_title_multiloc: project.title_multiloc,
          project_ideas_count: project.ideas_count,
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale)
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


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
      expect(mail.body.encoded).to match(Frontend::UrlService.new.admin_project_ideas_url(project.id))
    end
  end
end
