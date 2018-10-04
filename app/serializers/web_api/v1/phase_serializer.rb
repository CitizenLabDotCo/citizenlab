class WebApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :participation_method, :start_at, :end_at, :created_at, :updated_at

  #ParticipationContext attributes
  attributes :participation_method, :posting_enabled, :commenting_enabled, :voting_enabled, :voting_method, :voting_limited_max, :presentation_mode, :survey_embed_url, :survey_service
  
  belongs_to :project

  has_many :permissions

  has_one :action_descriptor


  def action_descriptor
    @participation_context_service ||= ParticipationContextService.new
    if object.survey?
      taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason object, current_user
      { taking_survey: {
          enabled: !taking_survey_disabled_reason,
          disabled_reason: taking_survey_disabled_reason
        }
      }
    else
      {}
    end
  end
end
