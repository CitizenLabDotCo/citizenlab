module Roles
  module Serializable
    extend ActiveSupport::Concern

    def serialize_resources(*resources)
      serializer.new(resources.flatten, params: { current_user: current_user }).serialized_json
    end

    def serializer
      role_mapping.serializer
    end
  end
end
