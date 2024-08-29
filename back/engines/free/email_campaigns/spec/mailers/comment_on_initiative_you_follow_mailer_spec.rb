# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentOnInitiativeYouFollowMailer do
  describe 'CommentOnInitiativeYouFollow' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentOnInitiativeYouFollow.create! }
    let_it_be(:initiative) { create(:initiative) }
    let_it_be(:initiator) { create(:user, first_name: 'Dries') }
    let_it_be(:comment) { create(:comment, post: initiative, body_multiloc: { 'en' => 'I agree' }, author: initiator) }
    let_it_be(:notification) { create(:comment_on_initiative_you_follow, recipient: recipient, post: initiative, comment: comment) }
    let_it_be(:command) do
      activity = create(:activity, item: notification, action: 'created')
      create(:comment_on_initiative_you_follow_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes the comment author name' do
      expect(mail.body.encoded).to include('Dries')
    end

    it 'includes the comment body' do
      expect(mail.body.encoded).to include('I agree')
    end

    it 'includes the unfollow url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: initiative, user: recipient)))
    end
  end
end
