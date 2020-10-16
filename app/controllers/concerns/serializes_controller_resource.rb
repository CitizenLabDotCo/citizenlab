# frozen_string_literal: true

#
# Defines a Controller Macro to easily access serialized resources using fastjson_api
#
#
#
#
module SerializesControllerResource
  extend ActiveSupport::Concern

  included do
    include ExtractsControllerResource
  end

  class_methods do
    private

    def serialize_resource(resource_name = nil, resource_options: {}, **options)
      @serializer_options = options

      resource(resource_name, resource_options)

      define_api_serialized_resource_methods
    end

    def define_api_serialized_resource_methods
      define_method :serialized_resource do |options = {}|
        self.class.serializer_class
            .new(resource, params: fastjson_params, **self.class.serializer_options.merge(options))
            .serialized_json
      end

      define_method :serialized_resource_errors do
        { errors: resource.errors.details }
      end
    end

    def extract_serializer_class
      return serializer_options.delete(:serializer) if serializer_options.dig(:serializer)

      namespaced_resource_object_class(:serializer) || raise(ArgumentError, 'Could not find Serializer Class')
    end

    public

    attr_reader :serializer_options

    def serializer_class
      @serializer_class ||= extract_serializer_class
    end
  end
end
