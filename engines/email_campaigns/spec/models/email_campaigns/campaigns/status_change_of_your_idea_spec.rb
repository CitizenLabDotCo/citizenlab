require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::StatusChangeOfYourIdea, type: :model do
  describe "StatusChangeOfYourIdea Campaign default factory" do
    it "is valid" do
      expect(build(:status_change_of_your_idea_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:status_change_of_your_idea_campaign) }
    let(:old_status) { create(:idea_status) }
    let(:idea) { create(:idea, idea_status: create(:idea_status)) }
    let(:initiator) { create(:admin) }
    let(:status_activity) { 
      create(
        :activity, item: idea, action: 'changed_status', user: initiator, 
        payload: {change: [old_status.id, idea.idea_status.id]}
        ) 
    }
    let(:notification) { Notifications::StatusChangeOfYourIdea.make_notifications_on(status_activity)&.first }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(
        recipient: notification_activity.item.recipient, 
        activity: notification_activity
        ).first

      expect(
      	command.dig(:event_payload, :recipient, :id)
      	).to eq(idea.author_id)
      expect(
      	command.dig(:event_payload, :idea_status, :id)
      	).to eq(idea.idea_status.id)
  	end
  end
end
