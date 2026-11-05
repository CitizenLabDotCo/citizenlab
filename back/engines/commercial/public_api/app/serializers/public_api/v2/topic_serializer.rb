# frozen_string_literal: true

# Serializer for the deprecated /api/v2/topics endpoint.
# Handles both GlobalTopic and InputTopic records with the same output format.
class PublicApi::V2::TopicSerializer < PublicApi::V2::BaseSerializer
  type :topic

  attributes :id,
    :title,
    :description,
    :created_at,
    :updated_at

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def description
    multiloc_service.t(object.description_multiloc)
  end
end
