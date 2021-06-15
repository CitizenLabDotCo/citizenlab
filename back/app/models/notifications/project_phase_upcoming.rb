# frozen_string_literal: true

module Notifications
  class ProjectPhaseUpcoming < Notification
    validates :phase, presence: true

    ACTIVITY_TRIGGERS = { 'Phase' => { 'upcoming' => true } }.freeze
    EVENT_NAME = 'Project phase upcoming'

    class << self
      def make_notifications_on(activity)
        phase = activity.item

        if phase.project
          recipients(phase.project_id).ids.map do |recipient_id|
            new(
              recipient_id: recipient_id,
              phase: phase,
              project: phase.project
            )
          end
        else
          []
        end
      end

      private

      def recipients(_project_id)
        User.admin
      end
    end
  end
end

Notifications::ProjectPhaseUpcoming.prepend_if_ee('ProjectManagement::Patches::Notifications::ProjectPhaseUpcoming')
