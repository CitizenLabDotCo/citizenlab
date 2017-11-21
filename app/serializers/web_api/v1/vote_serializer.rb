class WebApi::V1::VoteSerializer < ActiveModel::Serializer
  attributes :id, :mode

  belongs_to :votable
  belongs_to :user
end
