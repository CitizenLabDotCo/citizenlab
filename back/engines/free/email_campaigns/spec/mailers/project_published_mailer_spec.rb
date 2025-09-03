# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPublishedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: 'https://govocal.com/projects/example',
          project_title_multiloc: { 'en' => 'Example project title' },
          unfollow_url: 'https://govocal.com/unfollow'
        }
      }
    end

    let(:campaign) { create(:project_published_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'A new project was published on the platform of Liege'
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
          with_text(/A new project was published/)
        end
        with_tag 'p' do
          with_text(/The participation platform of Liege just published the following project:/)
        end
      end
    end

    it 'includes the new project box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/Example project title/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
        with_text(/Go to this project/)
      end
    end

    it 'includes the unfollow url' do
      expect(body).to match('https://govocal.com/unfollow')
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_published_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ projectName }}' },
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
              with_text(/NEW TITLE FOR Example project title/)
            end
            with_tag 'p' do
              with_text(/The participation platform of Liege just published the following project:/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end
    end
  end
end
