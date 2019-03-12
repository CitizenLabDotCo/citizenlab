module Notifications
  class ProjectPhaseStarted < Notification
    
    belongs_to :phase
    belongs_to :project, optional: true

    validates :phase_id, presence: true


    ACTIVITY_TRIGGERS = {'Phase' => {'started' => true}}
    EVENT_NAME = 'Project phase started'
    

    def self.make_notifications_on activity
      phase = activity.item

      phase_id = phase&.id
      initiator_id = activity&.user_id
      project_id = phase&.project_id

      if project_id
        user_scope = User.where.not(id: User.admin.or(User.project_moderator(project_id)).ids)
        ProjectPolicy::InverseScope.new(phase.project, user_scope).resolve.map do |recipient|
          self.create!(
             recipient_id: recipient.id,
             initiating_user: User.find(initiator_id),
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

