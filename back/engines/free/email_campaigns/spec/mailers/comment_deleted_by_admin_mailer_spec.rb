# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentDeletedByAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:comment) { create(:comment) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          comment_created_at: comment.created_at&.iso8601,
          comment_body_multiloc: comment.body_multiloc,
          reason_code: 'other',
          other_reason: "I don't tolerate criticism",
          idea_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale))
        }
      }
    end

    let(:campaign) { EmailCampaigns::Campaigns::CommentDeletedByAdmin.create! }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your comment has been deleted from the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail_body(mail)).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns the reason' do
      expect(mail_body(mail)).to match('I don\'t tolerate criticism')
    end

    it 'assigns go to post CTA' do
      comment_url = Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale))
      expect(mail_body(mail)).to match(comment_url)
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :comment_deleted_by_admin_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ organizationName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :comment_deleted_by_admin_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
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
              with_text(/NEW TITLE FOR Liege/)
            end
            with_tag 'p' do
              with_text(/Liege deleted the comment you wrote on an idea./)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a') do
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
              with_text(/NEW TITLE FOR Liege/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a') do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
