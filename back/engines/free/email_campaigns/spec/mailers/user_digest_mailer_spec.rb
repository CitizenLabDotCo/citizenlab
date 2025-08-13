# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::UserDigestMailer do
  describe 'UserDigest' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:proposal) { create(:proposal) }
    let_it_be(:idea) { create(:idea) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          notifications_count: 2,
          top_ideas: [
            {
              title_multiloc: idea.title_multiloc,
              body_multiloc: idea.body_multiloc,
              author_name: 'Ned Chipshop',
              likes_count: idea.likes_count,
              dislikes_count: idea.dislikes_count,
              comments_count: idea.comments_count,
              published_at: idea.published_at&.iso8601,
              url: 'http://www.example.com/idea',
              idea_images: [],
              top_comments: []
            }
          ],
          discover_projects: [],
          successful_proposals: [
            {
              id: proposal.id,
              title_multiloc: proposal.title_multiloc,
              url: 'http://www.example.com/proposal',
              published_at: proposal.published_at&.iso8601,
              author_name: 'Bob Muttcutts',
              likes_count: proposal.likes_count,
              dislikes_count: nil,
              comments_count: proposal.comments_count
            }
          ]
        }
      }
    end

    let(:campaign) { create(:user_digest_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq 'Your activity on the participation platform of Liege'
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
          with_text(/Discover what happened last week/)
        end
        with_tag 'p' do
          with_text(/Here's a summary of what happened on the participation platform of Liege./)
        end
      end
    end

    it 'includes the CTA' do
      expect(mail_body(mail)).to have_tag('a', with: { href: Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')) }) do
        with_text(/Go to the platform/)
      end
    end

    it 'contains the ideas and proposals' do
      expect(mail.body.encoded).to match(idea.title_multiloc['en'])
      expect(mail.body.encoded).to match(proposal.title_multiloc['en'])
    end

    describe 'when sent to users with a different locale set for each' do
      let(:event_payload) do
        {
          notifications_count: 2,
          top_ideas: [],
          discover_projects: [],
          successful_proposals: []
        }
      end

      let(:recipient1) { create(:user, locale: 'en') }
      let(:command1) { { recipient: recipient1, event_payload: event_payload } }

      let(:recipient2) { create(:user, locale: 'nl-NL') }
      let(:command2) { { recipient: recipient2, event_payload: event_payload } }

      let(:mail1) { described_class.with(command: command1, campaign: campaign).campaign_mail.deliver_now }
      let(:mail2) { described_class.with(command: command2, campaign: campaign).campaign_mail.deliver_now }

      it 'renders the mails in the correct language' do
        expect(mail1.body.encoded).to include('Discover what happened last week')
        expect(mail2.body.encoded).to include('Ontdek wat er vorige week is gebeurd')
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :user_digest_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE' },
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
              with_text(/NEW TITLE/)
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
