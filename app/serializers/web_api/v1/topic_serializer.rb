class WebApi::V1::TopicSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :title_multiloc, :description_multiloc, :icon
end