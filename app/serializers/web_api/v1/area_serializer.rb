class WebApi::V1::AreaSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc
end
