# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseStarted, type: :model do
  describe 'for regular users' do
    # it 'makes a notification on phase started activity' do
    #   user = create(:user)
    #   phase = create(:phase)
    #   activity = create :activity, item: phase, action: 'started', user: nil

    #   notifications = described_class.make_notifications_on activity
    #   expect(notifications.size).to eq 1
    #   expect(notifications.first).to have_attributes(
    #     recipient_id: user.id,
    #     phase_id: phase.id,
    #     project_id: phase.project_id
    #   )
    # end

    # it 'only creates a notification for users who can participate' do
    #   phase = create :phase
    #   activity = create :activity, item: phase, action: 'started'
    #   create_list :user, 2
    #   allow_any_instance_of(ParticipationContextService).to(
    #     receive(:participation_possible_for_context?).and_return(true, false)
    #   )

    #   notifications = described_class.make_notifications_on activity
    #   expect(notifications.size).to eq 1
    # end

    it 'only creates a notification for users who have participated' do
      project = create(:project_with_current_phase)
      activity = create :activity, item: project.phases[2], action: 'started'
      participant = create(:user)
      non_participant = create(:user)
      idea = create(:idea, project_id: project.id, author_id: participant.id)
      create :activity, item: idea, user_id: participant.id, action: 'published'
      notifications = described_class.make_notifications_on activity
      notification_ids = notifications.pluck(:recipient_id)

      expect(notification_ids).to include participant.id
      expect(notification_ids).not_to include non_participant.id
    end
  end

  describe 'for admins and moderators' do
    it 'only creates a notification for admins and moderators who are not a phase moderator' do
      project = create(:project_with_current_phase)
      activity = create :activity, item: project.phases[2], action: 'started'

      # Add more here, if we go down this route
    end
  end
end
