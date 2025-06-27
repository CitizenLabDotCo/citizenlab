# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewIdeaForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Gonzo') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewIdeaForAdmin.create! }
    let_it_be(:author) { create(:user, first_name: 'Kermit', last_name: 'the Frog') }

    describe 'when the input if published' do
      let_it_be(:input) { create(:idea, title_multiloc: { en: 'My idea title' }, publication_status: 'published', author: author) }
      let_it_be(:command) do
        activity = create(:activity, item: input, action: 'submitted')
        create(:new_idea_for_admin_campaign).generate_commands(
          activity: activity,
          recipient: recipient
        ).first.merge({ recipient: recipient })
      end
      let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
      let_it_be(:body) { mail_body(mail) }

      it 'renders the subject' do
        expect(mail.subject).to eq('Gonzo, a new input has been published on your platform')
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
            with_text(/Gonzo, a new input has been published on your platform/)
          end
          with_tag 'p' do
            with_text(/Kermit the Frog has submitted a new input on your platform\. Discover it now, give some feedback or change its status!/)
          end
        end
      end

      it 'includes the input box' do
        expect(body).to have_tag('table') do
          with_tag 'h2' do
            with_text(/My idea title/)
          end
          with_tag 'p' do
            with_text(/by Kermit the Frog/)
          end
        end
      end

      it 'includes the CTA' do
        expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
          with_text(/Give feedback to Kermit the Frog/)
        end
      end
    end

    describe 'when the input is in prescreening' do
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
      let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
      let_it_be(:body) { mail_body(mail) }

      it 'renders the subject' do
        expect(mail.subject).to eq('Gonzo, an input requires your review')
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
            with_text(/Gonzo, an input requires your review/)
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
    end
  end
end
