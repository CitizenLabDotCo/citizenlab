class WebApi::V1::External::VoteSerializer < ActiveModel::Serializer
  attributes :id, :mode, :user_id, :votable_id, :votable_type, :created_at
end
