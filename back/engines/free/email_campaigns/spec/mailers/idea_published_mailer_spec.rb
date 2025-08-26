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
    let_it_be(:input) { create(:idea, author: recipient) }
    let_it_be(:activity) { create(:activity, item: input, action: 'published') }

    let(:campaign) { EmailCampaigns::Campaigns::IdeaPublished.create! }
    let(:command) do
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

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
      let!(:global_campaign) do
        create(
          :idea_published_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject' },
          title_multiloc: { 'en' => 'NEW TITLE' }
        )
      end
      let!(:context_campaign) do
        create(
          :idea_published_campaign,
          context: input.phases.last,
          subject_multiloc: { 'en' => 'Custom Context Subject' },
          title_multiloc: { 'en' => 'NEW CONTEXT TITLE' },
          intro_multiloc: { 'en' => '<b>NEW CONTEXT BODY TEXT {{ projectTitle }}</b>' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject'
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
              with_text('')
            end
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
              with_text(/NEW CONTEXT TITLE/)
            end
            with_tag 'p' do
              with_text(/NEW CONTEXT BODY TEXT Renew West Parc/)
            end
          end
        end
      end
    end
  end
end
