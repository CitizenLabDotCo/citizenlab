# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseUpcoming do
  describe 'make_notifications_on' do
    let!(:admin) { create(:admin) }
    let!(:phase) { create(:phase) }
    let!(:activity) { create(:activity, item: phase, action: 'upcoming') }

    it 'makes a notification on created comment activity' do
      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: admin.id,
        phase_id: phase.id,
        project_id: phase.project_id
      )
    end

    it 'only notifies admins and moderators who can moderate project' do
      project = create(:project_with_current_phase, phases: [phase])
      other_project = create(:project_with_current_phase)
      project_folder = create(:project_folder, projects: [project])
      other_project_folder = create(:project_folder, projects: [other_project])

      regular_user = create(:user)
      moderator_of_project = create(:project_moderator, projects: [project])
      moderator_of_other_project = create(:project_moderator, projects: [other_project])
      moderator_of_project_folder = create(:project_folder_moderator, project_folders: [project_folder])
      moderator_of_other_project_folder = create(:project_folder_moderator, project_folders: [other_project_folder])

      notifications = described_class.make_notifications_on activity
      recipient_ids = notifications.pluck(:recipient_id)

      expect(recipient_ids).to include moderator_of_project.id
      expect(recipient_ids).to include moderator_of_project_folder.id
      expect(recipient_ids).to include admin.id
      expect(recipient_ids).not_to include regular_user.id
      expect(recipient_ids).not_to include moderator_of_other_project.id
      expect(recipient_ids).not_to include moderator_of_other_project_folder.id
    end
  end
end
