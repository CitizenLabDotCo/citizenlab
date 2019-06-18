class WebApi::V1::InitiativeStatusSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :ordering, :code, :color
end
