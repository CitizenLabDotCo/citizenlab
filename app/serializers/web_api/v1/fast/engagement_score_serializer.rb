class WebApi::V1::Fast::EngagementScoreSerializer < WebApi::V1::Fast::BaseSerializer
  set_id :id do |object|
    SecureRandom.uuid
  end

  attribute :sum_score

  belongs_to :user
end