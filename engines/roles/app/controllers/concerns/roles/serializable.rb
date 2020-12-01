module Roles
  module Serializable
    extend ActiveSupport::Concern

    def serialize_resources(*resources)
      serializer.new(resources.flatten, params: { current_user: current_user }, **serializer_options).serialized_json
    end

    def serializer
      role_mapping.serializer
    end

    def serializer_options
      role_mapping.serializer_options.symbolize_keys
    end
  end
end
