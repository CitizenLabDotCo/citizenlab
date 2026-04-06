# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPublished do
  describe 'ProjectPublished campaign default factory' do
    it 'is valid' do
      expect(build(:project_published_campaign)).to be_valid
    end
  end

  describe '#estimated_recipients' do
    let(:campaign) { create(:project_published_campaign) }
    let(:project) { create(:project) }
    let(:topic) { create(:topic) }

    before do
      project.global_topics << topic
    end

    it 'returns nil when no project is given' do
      expect(campaign.estimated_recipients).to be_nil
    end

    it 'returns followers of the project topics' do
      follower1 = create(:follower, followable: topic)
      follower2 = create(:follower, followable: topic)
      create(:user) # non-follower

      result = campaign.estimated_recipients(project: project)
      expect(result).to contain_exactly(follower1.user, follower2.user)
    end

    it 'returns followers of the project areas' do
      area = create(:area)
      project.areas << area
      follower = create(:follower, followable: area)

      result = campaign.estimated_recipients(project: project)
      expect(result).to include(follower.user)
    end

    it 'excludes users who declined consent' do
      follower1 = create(:follower, followable: topic)
      follower2 = create(:follower, followable: topic)
      create(:consent, user: follower2.user, campaign_type: campaign.type, consented: false)

      result = campaign.estimated_recipients(project: project)
      expect(result).to contain_exactly(follower1.user)
    end

    it 'respects group filtering when groups are configured' do
      group = create(:group)
      create(:campaigns_group, campaign: campaign, group: group)

      follower1 = create(:follower, followable: topic)
      create(:follower, followable: topic)
      create(:membership, group: group, user: follower1.user)

      result = campaign.estimated_recipients(project: project)
      expect(result).to contain_exactly(follower1.user)
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
