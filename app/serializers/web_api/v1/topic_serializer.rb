class WebApi::V1::TopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :ordering, :icon
end