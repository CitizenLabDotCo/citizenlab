# frozen_string_literal: true

class WebApi::V1::PhaseSerializer < WebApi::V1::ParticipationContextSerializer
  attributes :title_multiloc, :start_at, :end_at, :created_at, :updated_at, :ideas_count, :campaigns_settings

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project

  has_one :user_basket, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end

  def self.user_basket(object, params)
    preloaded_user_basket = params.dig(:user_baskets, object.id)&.first
    preloaded_user_basket || current_user(params)&.baskets&.select do |basket|
      (basket.participation_context_id == object.id) && (basket.participation_context_type == 'Phase')
    end&.first
  end
end

WebApi::V1::PhaseSerializer.include(GranularPermissions::WebApi::V1::Patches::PhaseSerializer)
