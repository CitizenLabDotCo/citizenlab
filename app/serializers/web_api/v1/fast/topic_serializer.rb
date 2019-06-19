class WebApi::V1::Fast::TopicSerializer
  include FastJsonapi::ObjectSerializer
  
  attributes :id, :title_multiloc, :description_multiloc, :icon
end