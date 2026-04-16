# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPublished do
  describe '.recipients' do
    it 'returns followers of the project topics, areas and folder' do
      topic = create(:global_topic)
      area = create(:area)
      project = create(:project, global_topics: [topic], areas: [area])
      folder = create(:project_folder, projects: [project])
      project.reload
      topic_follower = create(:follower, followable: topic)
      area_follower = create(:follower, followable: area)
      folder_follower = create(:follower, followable: folder)
      create(:follower) # unrelated follower

      recipients = described_class.recipients(project)
      expect(recipients).to contain_exactly(topic_follower.user, area_follower.user, folder_follower.user)
    end

    it 'returns no recipients for unlisted projects' do
      topic = create(:global_topic)
      project = create(:project, global_topics: [topic], admin_publication_attributes: { publication_status: 'draft' })
      create(:follower, followable: topic)

      expect(described_class.recipients(project)).to be_empty
    end

    it 'excludes followers who do not have access to the project' do
      area = create(:area)
      project = create(:project, areas: [area], visible_to: 'groups', groups: [create(:group)])
      create(:follower, followable: area)

      expect(described_class.recipients(project)).to be_empty
    end
  end

  describe 'make_notifications_on' do
    it 'generates exactly one notification for each follower of the idea' do
      topic = create(:global_topic)
      project = create(:project, global_topics: [topic])
      folder = create(:project_folder, projects: [project])
      project.reload
      follower1 = create(:follower, followable: folder)
      create(:follower)
      follower3 = create(:follower, followable: topic)

      activity = create(:activity, item: project, action: 'published')

      notifications = described_class.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to contain_exactly follower1.user_id, follower3.user_id
    end

    it "doesn't generate notifications for the initiating user" do
      topic = create(:global_topic)
      project = create(:project, global_topics: [topic])
      follower = create(:follower, followable: topic)

      activity = create(:activity, item: project, action: 'published', user: follower.user)

      notifications = described_class.make_notifications_on activity
      expect(notifications).to eq []
    end

    it "doesn't notify followers who don't have access the project" do
      area = create(:area)
      project = create(:project, areas: [area], visible_to: 'groups', groups: [create(:group)])
      _follower = create(:follower, followable: area)

      activity = create(:activity, item: project, action: 'published')

      notifications = described_class.make_notifications_on activity
      expect(notifications).to eq []
    end
  end
end
