# frozen_string_literal: true

# This serializer inherits from WebApi::V1::ProjectSerializer, as the polymorphic association in the
# MapConfigSerializer belongs_to: mappable association wants a ProjectSerializer in this namespace.
class CustomMaps::WebApi::V1::ProjectSerializer < WebApi::V1::ProjectSerializer
  #  has_one :map_config, serializer: CustomMaps::WebApi::V1::MapConfigSerializer # Copilot suggestion: probably not needed?
end
