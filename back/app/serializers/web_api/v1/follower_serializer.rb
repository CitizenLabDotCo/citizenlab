# frozen_string_literal: true

class WebApi::V1::FollowerSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at

  belongs_to :user
  belongs_to :followable, polymorphic: true
end
