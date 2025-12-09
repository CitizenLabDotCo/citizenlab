# frozen_string_literal: true

class WebApi::V1::IdeaExposureSerializer < WebApi::V1::BaseSerializer
  attribute :created_at

  belongs_to :idea
  belongs_to :user
  belongs_to :phase
end
