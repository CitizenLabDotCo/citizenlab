# frozen_string_literal: true

class WebApi::V1::InputTopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :icon,
    :full_title_multiloc, :depth, :children_count, :lft, :rgt

  belongs_to :project
  belongs_to :parent, serializer: WebApi::V1::InputTopicSerializer, record_type: :input_topic
  has_many :children, serializer: WebApi::V1::InputTopicSerializer, record_type: :input_topic
end
