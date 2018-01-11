class WebApi::V1::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :visible_to, :process_type, :ideas_count, :presentation_mode, :created_at, :updated_at

  # ParticipationContext attributes
  attribute :participation_method, if: :is_participation_context?
  attribute :posting_enabled, if: :is_participation_context?
  attribute :commenting_enabled, if: :is_participation_context?
  attribute :voting_enabled, if: :is_participation_context?
  attribute :voting_method, if: :is_participation_context?
  attribute :voting_limited_max, if: :is_participation_context?

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  
  has_one :actions_descriptor

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def is_participation_context?
    object.is_participation_context?
  end

  def actions_descriptor
    @participation_context_service ||= ParticipationContextService.new
    posting_disabled_reason = @participation_context_service.posting_disabled_reason(object)
    voting_disabled_reason = @participation_context_service.voting_disabled_reason(object, scope)
    {
      posting: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_enabled_phase(object)&.start_at
      }
    }
  end

end
