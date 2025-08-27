# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingBasketNotSubmittedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
          context_title_multiloc: 'Example phase title'
        }
      }
    end

    let(:campaign) { create(:voting_basket_not_submitted_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq "Liege: You didn't submit your votes"
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
          with_text(/You didn't submit your votes/)
        end
        with_tag 'p' do
          with_text(/You selected a few options for Example phase title but you didn't submit your selection./)
        end
      end
    end

    it 'includes the pre-CTA message' do
      expect(body).to have_tag('p') do
        with_text(/Click the button below to submit your selected options/)
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}" }) do
        with_text(/View options and vote/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :voting_basket_not_submitted_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ contextTitle }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :voting_basket_not_submitted_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ contextTitle }}' },
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
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Example phase title/)
            end
            with_tag 'p' do
              with_text(/You selected a few options for Example phase title but you didn't submit your selection./)
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
          expect(mail.subject).to eq 'Custom Context Subject - Example phase title'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Example phase title/)
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
