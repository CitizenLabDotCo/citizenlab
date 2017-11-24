class WebApi::V1::IdeaStatusSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :color, :ordering, :code, :description_multiloc
end
