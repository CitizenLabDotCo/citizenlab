# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnIdeaYouFollowMailer do
  describe 'CommentOnIdeaYouFollow' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.create! }
    let_it_be(:idea) { create(:idea) }
    let_it_be(:initiator) { create(:user, first_name: 'Marion', last_name: 'Smith') }
    let_it_be(:comment) { create(:comment, idea: idea, body_multiloc: { 'en' => 'I agree' }, author: initiator) }
    let_it_be(:notification) { create(:comment_on_idea_you_follow, recipient: recipient, idea: idea, comment: comment, initiating_user: initiator) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

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
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ input_title }}' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          intro_multiloc: { 'en' => '<b>BODY TEXT</b> new comment by {{ authorName }}' },
          button_text_multiloc: { 'en' => 'CLICK ME to go to "{{ inputTitle }}"' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Plant more trees'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>BODY TEXT</b> new comment by Marion')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK ME to go to "Plant more trees"')
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
  end
end
