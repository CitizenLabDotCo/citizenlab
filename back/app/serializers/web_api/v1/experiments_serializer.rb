# frozen_string_literal: true

class WebApi::V1::TopicSerializer < WebApi::V1::BaseSerializer
  attributes :name, :treatment, :payload, :user_id
end