require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnYourInitiativeMailer, type: :mailer do
  describe 'CommentOnYourInitiative' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::CommentOnYourInitiative.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:token) { ResetPasswordService.new.generate_reset_password_token recipient }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          "initiating_user_first_name": "Fred",
          "initiating_user_last_name": "Kroket",
          "comment_author_name": "Fred Kroket",
          "comment_body_multiloc": {
            "nl-BE": "Zoiets?\n<a href=\"https://imgur.com/a/9Kw42xT\" target=\"_blank\">https://imgur.com/a/9Kw42xT</a>"
          },
          "comment_url": "http://localhost:3000/nl-BE/ideas/wijgmaal-verkeersvrij-dorpsplein",
          "post_published_at": "2019-05-22T18:21:44Z",
          "post_title_multiloc": {
            "nl-BE": "Wijgmaal verkeersvrij dorpsplein"
          },
          "post_author_name": "Sander Van Garsse"
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
      expect(mail.body.encoded).to include("Fred")
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include("Zoiets")
    end
  end
end
