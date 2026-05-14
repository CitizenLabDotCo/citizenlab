# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPublished do
  describe 'ProjectPublished campaign default factory' do
    it 'is valid' do
      expect(build(:project_published_campaign)).to be_valid
    end
  end

  describe 'context configurable' do
    it 'supports Project as context class' do
      expect(described_class.supported_context_class).to eq(Project)
    end

    it 'is valid with a project context' do
      project = create(:project)
      campaign = build(:project_published_campaign, context: project)
      expect(campaign).to be_valid
    end

    it 'returns the project as activity context' do
      campaign = create(:project_published_campaign)
      notification = create(:project_published)
      activity = create(:activity, item: notification, action: 'created')
      expect(campaign.activity_context(activity)).to eq(notification.project)
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:project_published_campaign) }
    let(:notification) { create(:project_published) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match({
        event_payload: hash_including(
          project_title_multiloc: notification.project.title_multiloc,
          project_url: an_instance_of(String)
        )
      })
    end
  end
end
