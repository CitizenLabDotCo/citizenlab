class WebApi::V1::External::TopicSerializer < ActiveModel::Serializer
  attributes :title_multiloc, :description_multiloc, :icon
end