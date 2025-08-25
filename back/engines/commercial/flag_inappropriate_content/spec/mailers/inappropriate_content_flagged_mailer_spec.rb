# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FlagInappropriateContent::EmailCampaigns::InappropriateContentFlaggedMailer do
  describe 'campaign_mail' do
    let(:recipient) { create(:user, locale: 'en') }
    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          flaggable_type: 'Idea',
          flag_automatically_detected: false,
          flaggable_author_name: 'Hodor',
          flaggable_url: 'https://govocal.com/ideas/1',
          flaggable_title_multiloc: { 'en' => 'Example title' },
          flaggable_body_multiloc: { 'en' => 'Example body' }
        }
      }
    end
    let(:campaign) { create(:inappropriate_content_flagged_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('A post has been flagged for review')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/A post has been flagged for review/)
        end
      end
    end

    it 'includes the flaggable box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_tag 'p' do
            with_text(/Hodor wrote:/)
          end
          with_tag 'h2' do
            with_text(/Example title/)
          end
          with_tag 'p' do
            with_text(/Example body/)
          end
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/ideas/1' }) do
        with_text(/Review/)
      end
    end

    it 'includes explanation notes on manual flagging' do
      expect(body).not_to include('This post was automatically detected')
      expect(body).to have_tag('div') do
        with_tag 'p' do
          with_text(/If the post does not contain inappropriate content, you can remove the warning via your platform in the Activity tab in the admin panel./)
        end
      end
    end

    context 'when the flaggable is a comment and the flag was automatically detected' do
      let(:command) do
        {
          recipient: recipient,
          event_payload: {
            flaggable_type: 'Comment',
            flag_automatically_detected: true,
            flaggable_author_name: 'Aude Horname',
            flaggable_url: 'https://govocal.com/comments/1',
            flaggable_body_multiloc: { 'en' => 'Example comment' }
          }
        }
      end

      it 'includes the flaggable box' do
        expect(body).to have_tag('table') do
          with_tag 'div' do
            with_tag 'p' do
              with_text(/Aude Horname wrote:/)
            end
            with_tag 'h2' do
              with_text(/Example comment/)
            end
          end
        end
      end

      it 'includes explanation notes on automatic flagging' do
        expect(body).to have_tag('div') do
          with_tag 'p' do
            with_text(/This post was automatically detected as potentially containing inappropriate content. We’re sending you this notification so that you can review the post in accordance with your own moderation guidelines./)
          end
          with_tag 'p' do
            with_text(/If the post does not contain inappropriate content, you can remove the warning via your platform in the Activity tab in the admin panel./)
          end
        end
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :inappropriate_content_flagged_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ authorName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
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
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Hodor/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/ideas/1' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
