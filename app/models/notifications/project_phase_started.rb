module Notifications
  class ProjectPhaseStarted < Notification
    
    belongs_to :phase
    belongs_to :project, optional: true

    validates :phase_id, presence: true


    ACTIVITY_TRIGGERS = {'Phase' => {'started' => true}}
    EVENT_NAME = 'Project phase started'
    

    def self.make_notifications_on activity
      service = ParticipationContextService.new
      phase = activity.item

      phase_id = phase&.id
      project_id = phase&.project_id

      if project_id
        user_scope = User.where.not(id: User.admin.or(User.project_moderator(project_id)).ids)
        ProjectPolicy::InverseScope.new(phase.project, user_scope).resolve.map do |recipient|
          if ( !service.posting_disabled_reason_for_context(phase, recipient)\
            || !service.commenting_disabled_reason_for_context(phase, recipient)\
            || !service.voting_disabled_reason_for_context(phase, recipient)\
            || !service.taking_survey_disabled_reason_for_context(phase, recipient)\
            || !service.budgeting_disabled_reason_for_context(phase, recipient) )
            self.create!(
               recipient_id: recipient.id,
               phase_id: phase_id,
               project_id: project_id
             )
          end
        end.compact
      else
        []
      end
    end

  end
end

