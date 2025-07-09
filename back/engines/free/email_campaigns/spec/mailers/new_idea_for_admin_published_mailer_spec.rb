# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewIdeaForAdminPublishedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Gonzo') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::NewIdeaForAdminPublished.create! }
    let_it_be(:author) { create(:user, first_name: 'Kermit', last_name: 'the Frog') }

    let_it_be(:input) { create(:idea, title_multiloc: { en: 'My idea title' }, publication_status: 'published', author: author) }
    let_it_be(:command) do
      activity = create(:activity, item: input, action: 'submitted')
      create(:new_idea_for_admin_published_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('A new input has been published on your platform')
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
          with_text(/A new input has been published on your platform/)
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
