# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPublished do
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
