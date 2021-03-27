module Notifications
  class ProjectPhaseUpcoming < Notification

    validates :phase, presence: true


    ACTIVITY_TRIGGERS = {'Phase' => {'upcoming' => true}}
    EVENT_NAME = 'Project phase upcoming'
    

    def self.make_notifications_on activity
      phase = activity.item

      if phase.project
        user_scope = User.admin.or(User.project_moderator(phase.project_id))
        ProjectPolicy::InverseScope.new(phase.project, user_scope).resolve.ids.map do |recipient_id|
          self.new(
             recipient_id: recipient_id,
             phase: phase,
             project: phase.project
           )
        end
      else
        []
      end
    end

  end
end

