# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ThresholdReachedForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          idea_title_multiloc: { 'en' => 'Example idea title' },
          idea_author_name: 'Hodor',
          idea_url: 'https://example.com/ideas/1',
          assignee_first_name: 'Hans',
          assignee_last_name: 'Annee'
        }
      }
    end

    let(:campaign) { create(:threshold_reached_for_admin_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('"Example idea title" reached the voting threshold')
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
          with_text(/A proposal reached the voting threshold!/)
        end
      end
    end

    it 'includes the idea box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Example idea title/)
        end
        with_tag 'p' do
          with_text(/by Hodor/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://example.com/ideas/1' }) do
        with_text(/Take this proposal to the next steps/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :threshold_reached_for_admin_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ input_title }}' },
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
              with_text(/NEW TITLE FOR Example idea title/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://example.com/ideas/1' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
