require 'rails_helper'

RSpec.describe EmailCampaigns::InitiativeAssignedToYouMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::InitiativeAssignedToYou.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    
    let(:assigned_at) { Time.now }
    let!(:initiative) { create(:assigned_initiative, author: recipient, assigned_at: assigned_at) }
    let(:author_name) { UserDisplayNameService.new(AppConfiguration.instance, recipient).display_name!(initiative.author) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_author_name: author_name,
          post_published_at: initiative.published_at&.iso8601,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
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

    it 'assigns initiative author name' do
      expect(mail.body.encoded).to match(author_name)
    end

    it 'assigns go to initiative CTA' do
      admin_initiatives_url = Frontend::UrlService.new.admin_initiatives_url
      expect(mail.body.encoded).to match(admin_initiatives_url)
    end
  end
end
