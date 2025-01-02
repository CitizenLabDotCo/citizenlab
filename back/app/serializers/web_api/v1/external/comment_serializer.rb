# frozen_string_literal: true

class WebApi::V1::External::CommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :idea_id, :author_id, :created_at
end
