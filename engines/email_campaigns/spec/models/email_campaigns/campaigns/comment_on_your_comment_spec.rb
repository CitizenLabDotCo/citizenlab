require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnYourComment, type: :model do
  describe "CommentOnYourComment Campaign default factory" do
    it "is valid" do
      expect(build(:comment_on_your_comment_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_on_your_comment_campaign) }
    let(:notification) { create(:comment_on_your_comment) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :initiating_user_last_name)
      	).to eq(notification.initiating_user.last_name)
      expect(
      	command.dig(:event_payload, :comment_body_multiloc)
      	).to eq(notification.comment.body_multiloc)
  	end
  end
end
