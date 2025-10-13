# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::OfficialFeedbackOnIdeaYouFollowMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:idea_author) { create(:user, first_name: 'Kermit', last_name: 'the Frog') }
    let_it_be(:input) { create(:idea, title_multiloc: { 'en' => 'Input title' }, body_multiloc: { 'en' => 'Input body' }, author: idea_author) }
    let_it_be(:feedback_author_multiloc) { { 'en' => 'Gonzo' } }
    let_it_be(:feedback) { create(:official_feedback, body_multiloc: { 'en' => 'We appreciate your participation' }, idea: input, author_multiloc: feedback_author_multiloc) }
    let_it_be(:notification) { create(:official_feedback_on_idea_you_follow, recipient: recipient, idea: input, official_feedback: feedback) }

    let(:campaign) { create(:official_feedback_on_idea_you_follow_campaign) }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
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
      expect(mail.subject).to eq('An input you follow has received an official update on the platform of Vaudeville')
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
          with_text(/There's an update on an input you follow/)
        end
        with_tag 'p' do
          with_text(/Gonzo gave an update on the input 'Input title'\. Click the button below to enter the conversation with Gonzo/)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/Input title/)
        end
        with_tag 'p' do
          with_text(/Input body/)
        end
        with_tag 'p' do
          with_text(/Kermit the Frog/)
        end
      end
    end

    it 'includes the official feedback box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/Gonzo wrote:/)
        end
        with_tag 'p' do
          with_text(/We appreciate your participation/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to this input/)
      end
    end

    it 'includes the unfollow url' do
      expect(body).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: input, user: recipient)))
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :official_feedback_on_idea_you_follow_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ feedback_author_name }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :official_feedback_on_idea_you_follow_campaign,
          context: create(:phase),
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ input_title }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Vaudeville'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Gonzo/)
            end
            with_tag 'p' do
              with_text(/Gonzo gave an update on the input 'Input title'\. Click the button below to enter the conversation with Gonzo/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Input title'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Gonzo/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
