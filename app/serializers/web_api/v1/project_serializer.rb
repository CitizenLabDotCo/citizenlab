class WebApi::V1::ProjectSerializer < ActiveModel::Serializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :visible_to, :process_type, :ideas_count, :internal_role, :publication_status, :created_at, :updated_at, :ordering

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  has_many :permissions
  
  has_one :action_descriptor
  has_one :user_basket
  
  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def action_descriptor
    @participation_context_service ||= ParticipationContextService.new
    posting_disabled_reason = @participation_context_service.posting_disabled_reason object, current_user
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason object, current_user
    {
      posting: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_enabled_phase(object, current_user)&.start_at
      },
      taking_survey: {
        enabled:!taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      }
    }
  end

  def user_basket
    current_user&.baskets&.find_by participation_context_id: object.id
  end

  # checked by included ParticipationContextSerializer
  def is_participation_context?
    object.is_participation_context?
  end

end
