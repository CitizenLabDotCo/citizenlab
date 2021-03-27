require 'rails_helper'

RSpec.describe IdeaAssignment::EmailCampaigns::IdeaAssignedToYouMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:assigned_at) { Time.now }
    let!(:idea) { create(:assigned_idea, author: recipient, assigned_at: assigned_at) }
    let(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(idea.author) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_author_name: author_name,
          post_published_at: idea.published_at&.iso8601,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          post_assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601)
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to start_with('You have an assignment on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns idea author name' do
      expect(mail.body.encoded).to match(author_name)
    end

    it 'assigns go to idea CTA' do
      admin_ideas_url = Frontend::UrlService.new.admin_ideas_url
      expect(mail.body.encoded).to match(admin_ideas_url)
    end
  end
end
