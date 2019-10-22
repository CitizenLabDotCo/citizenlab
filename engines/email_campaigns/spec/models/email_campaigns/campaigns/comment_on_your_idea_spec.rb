require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnYourIdea, type: :model do
  describe "CommentOnYourIdea Campaign default factory" do
    it "is valid" do
      expect(build(:comment_on_your_idea_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_on_your_idea_campaign) }
    let(:notification) { create(:comment_on_your_idea) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :initiating_user_first_name)
      	).to eq(notification.initiating_user.first_name)
      expect(
      	command.dig(:event_payload, :comment_body_multiloc)
      	).to eq(notification.comment.body_multiloc)
  	end
  end
end
