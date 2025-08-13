# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::WelcomeMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }

    let(:campaign) { create(:welcome_campaign) }
    let(:command) { { recipient: recipient } }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'Welcome to the platform of Liege'
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
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
          with_text(/Welcome!/)
        end
        with_tag 'p' do
          with_text(/Congratulations, you successfully signed up on the participation platform of Liege. You can now discover the platform and make your voice heard. You can also add a profile picture and a short description to tell others who you are./)
        end
      end
    end

    it 'includes the CTA' do
      expect(mail_body(mail)).to have_tag('a', with: { href: Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')) }) do
        with_text(/Discover the platform/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :welcome_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Liege'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')) }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
