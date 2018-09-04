require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectModerationRightsReceived, type: :model do
  describe "ProjectModerationRightsReceived Campaign default factory" do
    it "is valid" do
      expect(build(:project_moderation_rights_received_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:project_moderation_rights_received_campaign) }
    let(:project) { create(:project) }
    let(:recipient) { create(:moderator, project: project) }
    let(:initiator) { create(:admin) }
    let(:serialized_initiator) { 
      ActiveModelSerializers::SerializableResource.new(initiator, {
        serializer: WebApi::V1::External::UserSerializer,
        adapter: :json
      }).serializable_hash 
    }
    let(:moderator_activity) { 
      create(:activity, item: recipient, user: initiator, action: 'project_moderation_rights_given', payload: {project_id: project.id}) 
    }
    let(:notification) { Notifications::ProjectModerationRightsReceived.make_notifications_on(moderator_activity)&.first }
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
      	).to eq(initiator.id)
      expect(
        command.dig(:event_payload, :project, :id)
        ).to eq(project.id)
  	end
  end
end
