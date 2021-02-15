require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnYourCommentMailer, type: :mailer do
  describe 'CommentOnYourComment' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::CommentOnYourComment.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:token) { ResetPasswordService.new.generate_reset_password_token recipient }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          "initiating_user_first_name": "Matthias",
          "initiating_user_last_name": "Geeke",
          "comment_author_name": "Matthias Geeke",
          "comment_body_multiloc": {
            "nl-BE": "<span class=\"cl-mention-user\" data-user-id=\"0b36289a-d95e-4998-bb8c-866cb58e0c90\" data-user-slug=\"lieve-kuypers\">@Lieve Kuypers<\/span> Dat zullen de pati\u00c3\u00abnten die op hun huisbezoek of thuisverpleging graag horen. ;) Sommige gezinnen hebben nu eenmaal nood aan meerdere wagens... "
          },
          "comment_url": "http:\/\/localhost:3000\/nl-BE\/ideas\/afschaffen-of-versoepelen-wetgeving-rond-verharden-van-voortuin",
          "post_title_multiloc": {
            "nl-BE": "Afschaffen of versoepelen wetgeving rond verharden van voortuin"
          },
          "post_type": "Idea"
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
      expect(mail.body.encoded).to include("Matthias")
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include("huisbezoek")
    end
  end
end
