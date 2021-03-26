class WebApi::V1::TopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :code, :ordering, :icon
end