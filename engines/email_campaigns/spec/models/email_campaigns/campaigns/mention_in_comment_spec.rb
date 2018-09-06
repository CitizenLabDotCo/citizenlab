require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::MentionInComment, type: :model do
  describe "MentionInComment Campaign default factory" do
    it "is valid" do
      expect(build(:mention_in_comment_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:mention_in_comment_campaign) }
    let(:mentioned_user) { create(:user) }
    let(:comment) { create(:comment_with_mentions, mentioned_users: [mentioned_user]) }
    let(:comment_activity) { 
      create(:activity, item: comment, action: 'mentioned', user: comment.author, payload: {mentioned_user: mentioned_user.id})
    }
    let(:notification) { Notifications::MentionInComment.make_notifications_on(comment_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(mentioned_user.id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(comment.author_id)
      expect(
      	command.dig(:event_payload, :comment, :id)
      	).to eq(comment.id)
  	end
  end
end
