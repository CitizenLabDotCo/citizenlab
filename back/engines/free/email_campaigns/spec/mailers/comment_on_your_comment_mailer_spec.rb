# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnYourCommentMailer do
  describe 'CommentOnYourComment' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
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

    let(:campaign) { EmailCampaigns::Campaigns::CommentOnYourComment.create! }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

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
      let!(:global_campaign) do
        create(
          :comment_on_your_comment_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ authorName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :comment_on_your_comment_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON to go to {{ post }} of {{ authorFirstName }}' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Liege'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Matthias Geeke/)
            end
            with_tag 'p' do
              with_text(/Matthias Geeke wrote a reply to your comment on 'Afschaffen of versoepelen wetgeving rond verharden van voortuin' on the participation platform. Click the button below to continue the conversation with Matthias./)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: 'http://localhost:3000/nl-BE/ideas/afschaffen-of-versoepelen-wetgeving-rond-verharden-van-voortuin' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Liege'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Matthias Geeke/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: 'http://localhost:3000/nl-BE/ideas/afschaffen-of-versoepelen-wetgeving-rond-verharden-van-voortuin' }) do
            with_text(/CLICK THE CONTEXT BUTTON to go to Afschaffen of versoepelen wetgeving rond verharden van voortuin of Matthias/)
          end
        end
      end
    end
  end
end
