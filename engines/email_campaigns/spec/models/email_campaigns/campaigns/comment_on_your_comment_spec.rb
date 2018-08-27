require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnYourComment, type: :model do
  describe "CommentOnYourComment Campaign default factory" do
    it "is valid" do
      expect(build(:comment_on_your_comment_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_on_your_comment_campaign) }
    let(:parent_comment) { create(:comment) }
    let(:child_comment) { create(:comment, parent: parent_comment) }
    let(:comment_activity) { create(:activity, item: child_comment, action: 'created') }
    let(:notification) { Notifications::CommentOnYourComment.make_notifications_on(comment_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_command(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(parent_comment.author_id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(child_comment.author_id)
      expect(
      	command.dig(:event_payload, :parent_comment, :id)
      	).to eq(parent_comment.id)
      expect(
      	command.dig(:event_payload, :comment, :id)
      	).to eq(child_comment.id)
  	end
  end
end
