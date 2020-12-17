require 'rails_helper'

RSpec.describe EmailCampaigns::AdminDigestMailer, type: :mailer do
  describe 'AdminDigest' do
    before do
      EmailCampaigns::Campaigns::AdminDigest.create!
      @recipient = create(:admin, locale: 'en')
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @recipient.id)
    end

    let(:command) do
      {
        recipient: @recipient,
        event_payload: {
          statistics: @statistics,
          top_project_ideas: @top_project_ideas,
          new_initiatives: @new_initiatives,
          succesful_initiatives: @succesful_initiatives
        },
        tracked_content: {
          idea_ids: @idea_ids,
          initiative_ids: @initiative_ids
        }
      }
    end

    let(:mail) { described_class.campaign_mail(EmailCampaigns::Campaigns::AdminDigest.first, command).deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your activity on')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([@recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(Tenant.current.settings.dig('core', 'organization_name')['en'])
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(tenant: Tenant.current, locale: 'en'))
    end
  end
end
