# frozen_string_literal: true

module Notifications
  class ProjectPhaseStarted < Notification
    validates :phase, :project, presence: true

    ACTIVITY_TRIGGERS = { 'Phase' => { 'started' => true } }.freeze
    EVENT_NAME = 'Project phase started'

    class << self
      def make_notifications_on(activity)
        service = ParticipationContextService.new
        phase = activity.item

        if phase.project
          user_scope = User.where.not(id: excluded_users(phase.project_id))
          ActiveRecord::Base.transaction do
            # We're using a transaction to garantee that
            # created notifications are rolled back when
            # something went wrong, thereby preventing users
            # to receive multiple notifications, for each
            # time the background job is retried. With
            # PostgreSQL's default repeatable read isolation
            # level, this transaction cannot be obstructed by
            # other transactions.
            ProjectPolicy::InverseScope.new(phase.project, user_scope).resolve.map do |recipient|
              next unless service.participation_possible_for_context? phase, recipient

              new(
                recipient: recipient,
                phase: phase,
                project: phase.project
              )
            end.compact
          end
        else
          []
        end
      end

      private

      # Notification are not sent to those users.
      def excluded_users(_project_id)
        User.admin
      end
    end
  end
end

Notifications::ProjectPhaseStarted.prepend_if_ee('ProjectManagement::Patches::Notifications::ProjectPhaseStarted')
