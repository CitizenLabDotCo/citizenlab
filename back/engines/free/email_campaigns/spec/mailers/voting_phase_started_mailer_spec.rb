# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingPhaseStartedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: 'https://govocal.com/projects/example',
          project_title_multiloc: { 'en' => 'Example project title' },
          phase_title_multiloc: { 'en' => 'Example phase title' },
          ideas: [
            {
              title_multiloc: {
                'en' => 'An idea title'
              },
              url: 'http://localhost:3000/en/ideas/an-idea',
              images: [
                {
                  versions: {
                    small: 'http://localhost:4000/uploads/small_image.jpeg',
                    medium: 'http://localhost:4000/uploads/medium_image.jpeg',
                    large: 'http://localhost:4000/uploads/large_image.jpeg',
                    fb: 'http://localhost:4000/uploads/fb_image.jpeg'
                  }
                }
              ]
            },
            {
              title_multiloc: {
                'en' => 'Another idea title'
              },
              url: 'http://localhost:3000/en/ideas/another-idea',
              images: [
                {
                  versions: {
                    small: 'http://localhost:4000/uploads/small_image.jpeg',
                    medium: 'http://localhost:4000/uploads/medium_image.jpeg',
                    large: 'http://localhost:4000/uploads/large_image.jpeg',
                    fb: 'http://localhost:4000/uploads/fb_image.jpeg'
                  }
                }
              ]
            }
          ]
        }
      }
    end

    let(:campaign) { create(:voting_phase_started_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject including project title' do
      expect(mail.subject).to eq 'Liege: The voting phase started for Example project title'
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
          with_text(/Example project title/)
        end
        with_tag 'p' do
          with_text(/The project "Example project title" is asking you to vote between 2 options:/)
        end
      end
    end

    it 'lists the voted ideas' do
      expect(body).to have_tag('div') do
        with_tag 'tr' do
          with_tag('img', with: { src: 'http://localhost:4000/uploads/small_image.jpeg' })
          with_tag('a', with: { href: 'http://localhost:3000/en/ideas/an-idea' }) do
            with_text(/An idea title/)
          end
        end
        with_tag 'tr' do
          with_tag('img', with: { src: 'http://localhost:4000/uploads/small_image.jpeg' })
          with_tag('a', with: { href: 'http://localhost:3000/en/ideas/another-idea' }) do
            with_text(/Another idea title/)
          end
        end
      end
    end

    it 'includes the pre-CTA message' do
      expect(body).to have_tag('p') do
        with_text(/Click the button below to participate/)
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
        with_text(/Go to the platform to vote/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :voting_phase_started_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ projectName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :voting_phase_started_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ numIdeas }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT' },
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
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Example project title/)
            end
            with_tag 'p' do
              with_text(/The project "Example project title" is asking you to vote between 2 options:/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - 2'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Example project title/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/projects/example' }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
