class WebApi::V1::InitiativeStatusSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :ordering, :code, :color
end
