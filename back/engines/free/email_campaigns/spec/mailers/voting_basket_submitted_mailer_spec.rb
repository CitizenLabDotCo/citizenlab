# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingBasketSubmittedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
          voted_ideas: [
            {
              title_multiloc: {
                'en' => 'A voted idea title'
              },
              url: 'http://localhost:3000/en/ideas/a-voted-idea',
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

    let(:campaign) { create(:voting_basket_submitted_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'Liege: You voted successfully'
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
          with_text(/You voted successfully/)
        end
        with_tag 'p' do
          with_text(/Thanks for participating. Your votes have been recorded. Visit the platform of Liege to see and manage your votes./)
        end
      end
    end

    it 'lists the voted ideas' do
      expect(body).to have_tag('div') do
        with_tag('img', with: { src: 'http://localhost:4000/uploads/small_image.jpeg' })
        with_tag('a', with: { href: 'http://localhost:3000/en/ideas/a-voted-idea' }) do
          with_text(/A voted idea title/)
        end
      end
    end

    it 'includes the pre-CTA message' do
      expect(body).to have_tag('p') do
        with_text(/Click the button below to participate/)
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}" }) do
        with_text(/See votes submitted/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :voting_basket_submitted_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :voting_basket_submitted_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject' },
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
              with_text(/NEW TITLE/)
            end
            with_tag 'p' do
              with_text(/Thanks for participating. Your votes have been recorded. Visit the platform of Liege to see and manage your votes./)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}" }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}" }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
