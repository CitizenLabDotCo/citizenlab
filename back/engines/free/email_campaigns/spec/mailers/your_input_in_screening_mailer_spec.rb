# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::YourInputInScreeningMailer do
  describe 'Welcome' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          input_id: SecureRandom.uuid,
          input_title_multiloc: { 'en' => 'title' },
          input_body_multiloc: { 'en' => 'body' },
          input_url: 'http://localhost:3000/ideas/1',
          prescreening_status_title_multiloc: { 'en' => 'prescreening status title' },
          prescreening_status_description_multiloc: { 'en' => 'prescreening status description' },
          input_term: 'project'
        }
      }
    end

    let(:campaign) { create(:your_input_in_screening_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq '"title" is almost published'
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'renders the reply to email' do
      expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
    end

    it 'includes the header' do
      expect(mail_body(mail)).to have_tag('div') do
        with_tag 'h1' do
          with_text(/Your project is in "prescreening status title"/)
        end
        with_tag 'p' do
          with_text(/"title" will become visible to others once it has been reviewed and approved./)
        end
      end
    end

    it 'includes the status box' do
      expect(mail_body(mail)).to have_tag('table') do
        with_tag 'b' do
          with_text(/prescreening status title/)
        end
        with_tag 'p' do
          with_text(/prescreening status description/)
        end
      end
    end

    it 'includes the CTA' do
      expect(mail_body(mail)).to have_tag('a', with: { href: 'http://localhost:3000/ideas/1' }) do
        with_text(/Go to your project/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :your_input_in_screening_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' }
        )
      end
      let!(:context_campaign) do
        create(
          :your_input_in_screening_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ input_title }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ prescreening_status_title }}' },
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
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - title'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/Your project is in "prescreening status title"/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT prescreening status title/)
            end
          end
        end
      end
    end
  end
end
