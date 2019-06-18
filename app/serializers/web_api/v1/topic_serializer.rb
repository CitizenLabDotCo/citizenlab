class WebApi::V1::TopicSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :icon
end