# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnYourCommentMailer do
  describe 'CommentOnYourComment' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentOnYourComment.create! }
    let_it_be(:token) { ResetPasswordService.new.generate_reset_password_token recipient }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: 'Matthias',
          initiating_user_last_name: 'Geeke',
          comment_author_name: 'Matthias Geeke',
          comment_body_multiloc: {
            'nl-BE': "<span class=\"cl-mention-user\" data-user-id=\"0b36289a-d95e-4998-bb8c-866cb58e0c90\" data-user-slug=\"lieve-kuypers\">@Lieve Kuypers</span> Dat zullen de pati\u00c3\u00abnten die op hun huisbezoek of thuisverpleging graag horen. ;) Sommige gezinnen hebben nu eenmaal nood aan meerdere wagens... "
          },
          comment_url: 'http://localhost:3000/nl-BE/ideas/afschaffen-of-versoepelen-wetgeving-rond-verharden-van-voortuin',
          idea_title_multiloc: {
            'nl-BE': 'Afschaffen of versoepelen wetgeving rond verharden van voortuin'
          },
          idea_type: 'Idea'
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

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
      expect(mail_body(mail)).to include('Matthias')
    end

    it 'includes the comment body' do
      expect(mail_body(mail)).to include('huisbezoek')
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ authorName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ post }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON - {{ authorFirstName }}' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Liege'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR Matthias Geeke')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT - Afschaffen of versoepelen wetgeving rond verharden van voortuin</b>')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON - Matthias')
      end
    end
  end
end
