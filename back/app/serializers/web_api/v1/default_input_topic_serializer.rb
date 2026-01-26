# frozen_string_literal: true

class WebApi::V1::DefaultInputTopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :icon,
    :full_title_multiloc, :depth, :children_count

  belongs_to :parent, serializer: WebApi::V1::DefaultInputTopicSerializer, record_type: :default_input_topic
  has_many :children, serializer: WebApi::V1::DefaultInputTopicSerializer, record_type: :default_input_topic
end
