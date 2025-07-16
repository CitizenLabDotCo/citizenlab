# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewIdeaForAdminPrescreeningMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Gonzo') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewIdeaForAdminPrescreening.create! }
    let_it_be(:author) { create(:user, first_name: 'Kermit', last_name: 'the Frog') }

    let_it_be(:input) { create(:proposal, title_multiloc: { en: 'My proposal title' }, publication_status: 'submitted', idea_status: create(:proposals_status, code: 'prescreening'), author: author) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          idea_submitted_at: input.submitted_at&.iso8601,
          idea_published_at: input.published_at&.iso8601,
          idea_title_multiloc: input.title_multiloc,
          idea_author_name: input.author_name,
          idea_url: Frontend::UrlService.new.model_to_url(input, locale: Locale.new(recipient.locale))
        }
      }
    end
    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('An input requires your review')
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
          with_text(/An input requires your review/)
        end
        with_tag 'p' do
          with_text(/Kermit the Frog has submitted a new input on your platform\./)
        end
        with_tag 'div' do
          with_text(/The input won't be visible until you modify its status\./)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/My proposal title/)
        end
        with_tag 'p' do
          with_text(/by Kermit the Frog/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Review the input/)
      end
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE - {{ firstName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ authorName }}</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Liege'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE - Gonzo')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT - Kermit the Frog</b>')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON')
      end
    end
  end
end
