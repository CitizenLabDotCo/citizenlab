require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnYourIdea, type: :model do
  describe "CommentOnYourIdea Campaign default factory" do
    it "is valid" do
      expect(build(:comment_on_your_idea_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_on_your_idea_campaign) }
    let(:comment) { create(:comment) }
    let(:comment_activity) { create(:activity, item: comment, action: 'created') }
    let(:notification) { Notifications::CommentOnYourIdea.make_notifications_on(comment_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_command recipient: notification_activity.item.recipient, activity: notification_activity

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(comment.idea.author_id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(comment.author_id)
      expect(
      	command.dig(:event_payload, :comment, :id)
      	).to eq(comment.id)
  	end
  end
end
