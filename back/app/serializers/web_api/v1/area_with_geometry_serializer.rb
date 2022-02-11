class WebApi::V1::AreaWithGeometrySerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :geometry, :ordering
end
