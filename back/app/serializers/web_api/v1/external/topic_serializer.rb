class WebApi::V1::External::TopicSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :icon
end