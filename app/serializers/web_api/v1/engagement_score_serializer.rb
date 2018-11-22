class WebApi::V1::EngagementScoreSerializer < ActiveModel::Serializer
  attribute :id
  attribute :sum_score

  belongs_to :user

  def id
    SecureRandom.uuid
  end
end