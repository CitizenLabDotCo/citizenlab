# frozen_string_literal: true

class WebApi::V1::External::VoteSerializer < ActiveModel::Serializer
  attributes :id, :mode, :user_id, :reactable_id, :reactable_type, :created_at
end
