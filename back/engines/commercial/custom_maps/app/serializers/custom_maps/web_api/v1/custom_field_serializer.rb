# frozen_string_literal: true

# This serializer inherits from WebApi::V1::CustomFieldSerializer, as the polymorphic association in the
# MapConfigSerializer, belongs_to: mappable, needs a CustomFieldSerializer in this namespace.
class CustomMaps::WebApi::V1::CustomFieldSerializer < WebApi::V1::CustomFieldSerializer
end
