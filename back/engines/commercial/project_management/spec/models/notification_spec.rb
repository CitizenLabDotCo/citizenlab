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
      moderator = create(:moderator, project: project)
      activity = create(:activity, item: moderator, action: 'project_moderation_rights_given',
                                   payload: { project_id: project.id })

      notifications = Notifications::ProjectModerationRightsReceived.make_notifications_on activity
      expect(notifications).to be_present
    end

    shared_examples 'make project_phase_started' do |phase, expected_ids|
      let(:activity) { create(:activity, item: phase, action: 'started') }
      let(:notifications) { Notifications::ProjectPhaseStarted.make_notifications_on(activity) }

      it { expect(notifications.map(&:recipient_id)).to match_array(expected_ids) }
    end

    context "when the project is visible only to some groups" do
      let(:phase) { create(:active_phase) }
      let!(:project) do
        phase.project.tap do |project|
          project.visible_to = 'groups'
          project.groups << create(:group)
        end
      end

      context "and the user moderates the project" do
        let(:user) { create(:moderator, project: project, manual_groups: [project.groups.first])}

        include_examples 'make project_phase_started', phase, []
      end

      context "and the user moderates another project" do
        let(:user) { create(:moderator, manual_groups: [project.groups.first])}

        include_examples 'make project_phase_started', phase, [user.id]
      end
    end
  end
end
