# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaPublishedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::IdeaPublished.create! }
    let_it_be(:input) { create(:idea, author: recipient) }
    let_it_be(:activity) { create(:activity, item: input, action: 'published') }
    let_it_be(:command) do
      create(:idea_published_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('Your idea has been published')
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
          with_text(/You posted/)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'p' do
          with_text(/Reach more people/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to your idea/)
      end
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT</b>')
      end
    end
  end
end
