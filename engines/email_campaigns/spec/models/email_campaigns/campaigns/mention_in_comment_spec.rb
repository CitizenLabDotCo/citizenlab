require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::MentionInComment, type: :model do
  describe "MentionInComment Campaign default factory" do
    it "is valid" do
      expect(build(:mention_in_comment_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:mention_in_comment_campaign) }
    let(:notification) { create(:mention_in_comment) }
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
