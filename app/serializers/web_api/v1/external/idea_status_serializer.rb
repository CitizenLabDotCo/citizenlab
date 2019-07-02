class WebApi::V1::External::IdeaStatusSerializer < ActiveModel::Serializer
  attributes :title_multiloc, :color, :ordering, :code, :description_multiloc
end
