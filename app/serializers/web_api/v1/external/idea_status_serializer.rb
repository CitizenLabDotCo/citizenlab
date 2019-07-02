class WebApi::V1::External::IdeaStatusSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :color, :ordering, :code, :description_multiloc
end
