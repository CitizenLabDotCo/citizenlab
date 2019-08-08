require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentDeletedByAdmin, type: :model do
  describe "CommentDeletedByAdmin Campaign default factory" do
    it "is valid" do
      expect(build(:comment_deleted_by_admin_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_deleted_by_admin_campaign) }
    let(:notification) { create(:comment_deleted_by_admin) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(notification.recipient_id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(notification.initiating_user_id)
      expect(
      	command.dig(:event_payload, :comment, :id)
      	).to eq(notification.comment_id)
  	end
  end
end
