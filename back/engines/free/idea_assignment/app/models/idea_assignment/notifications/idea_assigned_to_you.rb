return unless defined? ::Notification

module IdeaAssignment
  module Notifications
    class IdeaAssignedToYou < ::Notification
      validates :initiating_user, :post, :project, presence: true
      validates :post_type, inclusion: { in: ['Idea'] }

      ACTIVITY_TRIGGERS = { 'Idea' => { 'changed_assignee' => true } }.freeze
      EVENT_NAME = 'Idea assigned to you'.freeze

      def self.make_notifications_on(activity)
        idea = activity.item
        recipient_id = idea.assignee_id
        initiator_id = activity.user_id

        # We only notify manual assignments, meaning there needs to be an
        # initiator
        if recipient_id && initiator_id && recipient_id != initiator_id
          [
            new(
              recipient_id: recipient_id,
              post: idea,
              project_id: idea.project_id,
              initiating_user_id: initiator_id
            )
          ]
        else
          []
        end
      end
    end
  end
end
