module Notifications
  class ProjectPhaseUpcoming < Notification
    
    belongs_to :phase
    belongs_to :project, optional: true

    validates :phase_id, presence: true


    ACTIVITY_TRIGGERS = {'Phase' => {'upcoming' => true}}
    EVENT_NAME = 'Project phase upcoming'
    

    def self.make_notifications_on activity
      phase = activity.item

      phase_id = phase&.id
      project_id = phase&.project_id

      if project_id
        user_scope = User.admin.or(User.project_moderator(project_id))
        ProjectPolicy::InverseScope.new(phase.project, user_scope).resolve.map do |recipient|
          self.new(
             recipient_id: recipient.id,
             phase_id: phase_id,
             project_id: project_id
           )
        end
      else
        []
      end
    end

  end
end

