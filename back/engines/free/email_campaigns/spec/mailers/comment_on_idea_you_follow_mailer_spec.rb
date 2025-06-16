# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnIdeaYouFollowMailer do
  describe 'CommentOnIdeaYouFollow' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.create! }
    let_it_be(:idea) { create(:idea) }
    let_it_be(:initiator) { create(:user, first_name: 'Marion') }
    let_it_be(:comment) { create(:comment, idea: idea, body_multiloc: { 'en' => 'I agree' }, author: initiator) }
    let_it_be(:notification) { create(:comment_on_idea_you_follow, recipient: recipient, idea: idea, comment: comment, initiating_user: initiator) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:comment_on_idea_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let(:mail_body) { mail.body.encoded.gsub(/(=?)\r\n/, '') } # Remove encoded newlines to ensure matching

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    context 'default mail' do
      let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

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
        expect(mail_body).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
      end

      it 'includes the comment author name' do
        expect(mail_body).to include('Marion')
      end

      it 'includes the comment body' do
        expect(mail_body).to include('I agree')
      end

      it 'includes the unfollow url' do
        expect(mail_body).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: idea, user: recipient)))
      end
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
        expect(mail_body).to include('NEW TITLE')
      end

      it 'can customise the body including HTML' do
        expect(mail_body).to include('<b>BODY TEXT</b> new comment by Marion')
      end

      it 'can customise the cta button' do
        expect(mail_body).to include('CLICK ME to go to "Plant more trees"')
      end
    end

    # TODO: Make this generic for all campaigns
    describe 'editable regions' do
      it 'has editable regions that match defined multilocs' do
        described_class.editable_regions.each do |region|
          expect { campaign.send(:"#{region[:key]}_multiloc") }.not_to raise_error
        end
      end
    end
  end
end
