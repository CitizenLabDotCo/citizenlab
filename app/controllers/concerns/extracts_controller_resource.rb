# frozen_string_literal: true

#
# Defines a Controller Macro to easily access @resource_variables in a controller
#
#
#
#
module ExtractsControllerResource
  extend ActiveSupport::Concern

  COLLECTION_METHODS = %i[index bulk_update].freeze
  MEMBER_METHODS = %i[show new update destroy reorder].freeze

  included do
    extend ClassMethods
  end

  # ExtractsControllerResource::ClassMethods
  module ClassMethods
    private

    def resource(resource_name = nil, **options)
      @resource_name = resource_name || controller_resource_name
      @resource_options = options

      define_resource_methods
    end

    def collection_method?(params)
      !params[:id] || COLLECTION_METHODS.include?(params[:action])
    end

    def define_resource_methods
      define_method(:resource) do
        instance_variable_get self.class.resource_variable_from(params)
      end
    end

    def namespaced_resource_object_class(object_name)
      [namespaced_resource_class, object_name.to_s.classify].join.safe_constantize
    end

    def namespaced_resource_class
      to_s.gsub('Controller', '').singularize
    end

    def resource_collection
      instance_variable_get "@#{@resource_name.pluralize}"
    end

    def controller_resource_name
      namespaced_resource_class.demodulize
    end

    def member_variable
      ['@', controller_resource_name.underscore].join
    end

    def collection_variable
      member_variable.pluralize
    end

    public

    def resource_variable_from(params)
      return collection_variable if collection_method?(params)

      member_variable
    end
  end
end
