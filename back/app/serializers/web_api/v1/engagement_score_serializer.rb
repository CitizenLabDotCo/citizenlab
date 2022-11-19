# frozen_string_literal: true

class WebApi::V1::EngagementScoreSerializer < WebApi::V1::BaseSerializer
  set_id :id do |_object|
    SecureRandom.uuid
  end

  attribute :sum_score

  belongs_to :user
end
