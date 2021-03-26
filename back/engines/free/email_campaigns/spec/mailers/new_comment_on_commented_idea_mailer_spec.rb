require 'rails_helper'

RSpec.describe EmailCampaigns::NewCommentOnCommentedIdeaMailer, type: :mailer do
  describe 'NewCommentOnCommentedIdea' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::NewCommentOnCommentedIdea.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          "initiating_user_first_name": "Ronny",
          "initiating_user_last_name": "Vanden Bempt",
          "post_published_at": "2019-04-30T20:00:04Z",
          "post_title_multiloc": {
            "nl-BE": "leuven autobusvrij"
          },
          "comment_body_multiloc": {
            "nl-BE": "<span class=\"cl-mention-user\" data-user-id=\"8033c17d-7ea2-4fc4-9895-8f98b589303a\" data-user-slug=\"matthias-vandegaer\">@Matthias Vandegaer</span> Interessant. Misschien te combineren met een vlottere busafhandeling op de ring: <a href=\"https://leuvenmaakhetmee.be/nl-BE/ideas/leuvense-ring-enkelrichting-voor-privevervoer\" target=\"_blank\">https://leuvenmaakhetmee.be/nl-BE/ideas/leuvense-ring-enkelrichting-voor-privevervoer</a>?"
          },
          "comment_url": "http://localhost:3000/nl-BE/ideas/leuven-autobusvrij"
        }
      }
    end

    it 'renders the subject' do
      expect(mail.subject).to be_present
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes the comment author name' do
      expect(mail.body.encoded).to include("Ronny")
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include("Interessant")
    end
  end
end
