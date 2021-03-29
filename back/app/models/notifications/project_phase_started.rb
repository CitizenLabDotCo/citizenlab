module Notifications
  class ProjectPhaseStarted < Notification

    validates :phase, :project, presence: true


    ACTIVITY_TRIGGERS = {'Phase' => {'started' => true}}
    EVENT_NAME = 'Project phase started'
    

    def self.make_notifications_on activity
      service = ParticipationContextService.new
      phase = activity.item

      if phase.project
        user_scope = User.where.not(id: User.admin.or(User.project_moderator(phase.project_id)).ids)
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
            if service.participation_possible_for_context? phase, recipient
              self.new(
                 recipient: recipient,
                 phase: phase,
                 project: phase.project
               )
            end
          end.compact
        end
      else
        []
      end
    end

  end
end

