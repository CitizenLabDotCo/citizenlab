require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentMarkedAsSpam, type: :model do
  describe "CommentMarkedAsSpam Campaign default factory" do
    it "is valid" do
      expect(build(:comment_marked_as_spam_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:comment_marked_as_spam_campaign) }
    let(:comment) { create(:comment) }
    let!(:recipient) { create(:admin) }
    let(:spam_report) { create(:spam_report, spam_reportable: comment) }
    let(:spam_activity) { create(:activity, item: spam_report, action: 'created') }
    let(:notification) { Notifications::CommentMarkedAsSpam.make_notifications_on(spam_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(recipient.id)
      expect(
      	command.dig(:event_payload, :initiating_user, :id)
      	).to eq(spam_report.user_id)
      expect(
      	command.dig(:event_payload, :spam_report, :id)
      	).to eq(spam_report.id)
  	end
  end
end
