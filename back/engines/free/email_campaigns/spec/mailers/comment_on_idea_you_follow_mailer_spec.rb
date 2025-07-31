# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnIdeaYouFollowMailer do
  describe 'CommentOnIdeaYouFollow' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:idea) { create(:idea) }
    let_it_be(:phase) { idea.phases.last }
    let_it_be(:initiator) { create(:user, first_name: 'Marion', last_name: 'Smith') }
    let_it_be(:comment) { create(:comment, idea: idea, body_multiloc: { 'en' => 'I agree' }, author: initiator) }
    let_it_be(:notification) { create(:comment_on_idea_you_follow, recipient: recipient, idea: idea, comment: comment, initiating_user: initiator) }

    let(:campaign) { EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.create! }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to be_present
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail_body(mail)).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes the comment author name' do
      expect(mail_body(mail)).to include('Marion')
    end

    it 'includes the comment body' do
      expect(mail_body(mail)).to include('I agree')
    end

    it 'includes the unfollow url' do
      expect(mail_body(mail)).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: idea, user: recipient)))
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :comment_on_idea_you_follow_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ input_title }}' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON to go to "{{ inputTitle }}"' }
        )
      end
      let!(:context_campaign) do
        create(
          :comment_on_idea_you_follow_campaign,
          context: phase,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ input_title }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Plant more trees'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE/)
            end
            with_tag 'p' do
              with_text(/Marion Smith placed a reaction on 'Plant more trees'. Click the button below to continue the conversation with Marion Smith./)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: "http://example.org/en/ideas/#{idea.slug}" }) do
            with_text(/CLICK THE GLOBAL BUTTON to go to "Plant more trees"/)
          end
        end

        context 'title region has not been customised' do
          before do
            campaign.update!(title_multiloc: {})
            command[:event_payload][:idea_input_term] = 'question'
          end

          it 'returns a title contextual to the input term when the region has not been customised' do
            expect(mail_body(mail)).to include('Marion Smith commented on a question you follow')
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Plant more trees'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
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
          expect(mail_body(mail)).to have_tag('a', with: { href: "http://example.org/en/ideas/#{idea.slug}" }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
