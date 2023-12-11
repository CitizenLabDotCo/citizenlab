# frozen_string_literal: true

module Surveys::WebApi::V1::SurveyPhaseSerializer
  extend ActiveSupport::Concern

  included do
    attribute :survey_embed_url
    attribute :survey_service
  end
end
