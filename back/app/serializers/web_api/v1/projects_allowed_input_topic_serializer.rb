# frozen_string_literal: true

class WebApi::V1::ProjectsAllowedInputTopicSerializer < WebApi::V1::BaseSerializer
  attributes :ordering

  has_one :project
  has_one :topic, serializer: WebApi::V1::GlobalTopicSerializer
end
