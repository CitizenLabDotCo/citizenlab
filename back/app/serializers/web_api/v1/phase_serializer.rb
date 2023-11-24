# frozen_string_literal: true

class WebApi::V1::PhaseSerializer < WebApi::V1::ParticipationContextSerializer
  include Polls::WebApi::V1::PollPhaseSerializer
  include Surveys::WebApi::V1::SurveyPhaseSerializer
  include DocumentAnnotation::WebApi::V1::DocumentAnnotationPhaseSerializer

  attributes :title_multiloc, :start_at, :end_at, :created_at, :updated_at, :ideas_count, :campaigns_settings

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :previous_phase_end_at_updated do |object|
    object.previous_phase_end_at_updated?
  end

  belongs_to :project

  has_one :user_basket, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end

  has_one :report, serializer: ReportBuilder::WebApi::V1::ReportSerializer

  has_many :permissions

  def self.user_basket(object, params)
    preloaded_user_basket = params.dig(:user_baskets, object.id)&.first
    preloaded_user_basket || current_user(params)&.baskets&.select do |basket|
      (basket.participation_context_id == object.id) && (basket.participation_context_type == 'Phase')
    end&.first
  end
end
