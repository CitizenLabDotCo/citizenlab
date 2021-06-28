# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:notification)).to be_valid
    end
  end

  describe 'make_notifications_on' do
    it 'makes a project moderation rights received notification on moderator (user) project_moderation_rights_given' do
      project = create(:project)
      moderator = create(:project_moderator, projects: [project])
      activity = create(:activity, item: moderator, action: 'project_moderation_rights_given',
                                   payload: { project_id: project.id })

      notifications = Notifications::ProjectModerationRightsReceived.make_notifications_on activity
      expect(notifications).to be_present
    end

    context "when the project is visible only to some groups" do
      let(:phase) { create(:active_phase) }
      let!(:project) do
        phase.project.tap do |project|
          project.visible_to = 'groups'
          project.groups << create(:group)
        end
      end
      let(:notifications) do
        activity = create(:activity, item: phase, action: 'started')
        Notifications::ProjectPhaseStarted.make_notifications_on(activity)
      end

      context "and the user moderates the project" do
        before { create(:project_moderator, projects: [project], manual_groups: [project.groups.first]) }

        it { expect(notifications.map(&:recipient_id)).to eq [] }
      end

      context "and the user moderates another project" do
        let!(:user) { create(:project_moderator, manual_groups: [project.groups.first]) }

        it { expect(notifications.map(&:recipient_id)).to eq [user.id] }
      end
    end
  end
end
