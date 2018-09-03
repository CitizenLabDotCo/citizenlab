require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentDeletedByAdmin, type: :model do
  describe "CommentDeletedByAdmin Campaign default factory" do
    it "is valid" do
      expect(build(:comment_deleted_by_admin_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_deleted_by_admin_campaign) }
    let(:comment) { create(:comment) }
    let(:admin) { create(:admin) }
    let(:comment_activity) { 
      create(
        :activity, item: comment, action: 'marked_as_deleted', user: admin, 
        payload: {reason_code: 'other', other_reason: 'too boring'}
        )
    }
    let(:notification) { Notifications::CommentDeletedByAdmin.make_notifications_on(comment_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(comment.author_id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(admin.id)
      expect(
      	command.dig(:event_payload, :comment, :id)
      	).to eq(comment.id)
  	end
  end
end
