# frozen_string_literal: true

##
# Defines a Controller Macro to easily access serialized resources using fastjson_api
module SerializesControllerResource
  extend ActiveSupport::Concern

  included do
    include ExtractsControllerResource
    extend ClassMethods
  end

  ##
  # Defines the ClassMethods used by a Controller that SerializesControllerResource.
  module ClassMethods
    ##
    # Defines a +#serialized_resource+ instance method that returns a *collection* or *member* of a class.
    #
    # @example Trigger the generator without passing a +resource_name+
    #
    #   class IdeasController < ApplicationController
    #     include SerializesControllerResource
    #     serialize_resource
    #
    #     def index
    #       @ideas = Idea.all
    #       serialized_resource #=> @return Idea.all serialized by the IdeaSerializer
    #     end
    #
    #     def show
    #       @idea = Idea.find(2)
    #       serialized_resource #=> @return Idea.find(2) serialized by the IdeaSerializer
    #     end
    #   end
    #
    #
    # @example Trigger the generator passing a +resource_name+
    #
    #   class AbstractController < ApplicationController
    #     include SerializesControllerResource
    #     serialize_resource :idea
    #
    #     def index
    #       @ideas = Idea.all
    #       serialized_resource #=> @return Idea.all serialized by the IdeaSerializer
    #     end
    #
    #     def show
    #       @idea = Idea.find(2)
    #       serialized_resource #=> @return Idea.find(2) serialized by the IdeaSerializer
    #     end
    #   end
    #
    #
    # @example Trigger the generator passing a +resource_name+ and an option to change the +serializer+ class.
    #
    #   class AbstractController < ApplicationController
    #     include SerializesControllerResource
    #     serialize_resource :idea, serializer: AnotherIdeaSerializer
    #
    #     def index
    #       @ideas = Idea.all
    #       serialized_resource #=> @return Idea.all serialized by the AnotherIdeaSerializer
    #     end
    #
    #     def show
    #       @idea = Idea.find(2)
    #       serialized_resource #=> @return Idea.find(2) serialized by the AnotherIdeaSerializer
    #     end
    #   end
    #
    # @param resource_name [String, Symbol, nil]  The name of the +Resource+ class used in the controller's CRUD.
    # @param options [Hash, nil] The optional arguments to generate the resource helpers.
    # @return nil
    def serialize_resource(resource_name = nil, **options)
      @resource_name = resource_name
      @default_serializer_options = options

      resource(resource_name, default_serializer_options.delete(:resource_options) || {})

      delegate_serializer_helpers_to_class
      define_serialized_resource_method
      define_serialized_resource_errors_method
      define_default_serializer_params_helper
    end

    private

    ## Defines #serialized_resource
    def define_serialized_resource_method
      define_method :serialized_resource do |options = {}|
        options[:params] ||= default_serializer_params
        serializer_options = default_serializer_options.merge(options)

        serializer_class.new(resource, **serializer_options).serialized_json
      end
    end

    ## Defines #serialized_resource_errors
    def define_serialized_resource_errors_method
      define_method :serialized_resource_errors do
        { errors: resource.errors.details }
      end
    end

    ## Defines #default_serializer_params helper method
    def define_default_serializer_params_helper
      define_method :default_serializer_params do
        param_keys = default_serializer_options.delete(:params) || []

        fastjson_params.merge(params.permit(param_keys))
      end
    end

    def delegate_serializer_helpers_to_class
      delegate :default_serializer_options, :serializer_class, to: :class
    end

    public

    attr_reader :default_serializer_options

    ##
    # Returns the +serializer+ class from the controller name or +options+ parameter.
    def serializer_class
      @serializer_class ||= extract_serializer_class
    end

    private

    def extract_serializer_class
      return default_serializer_options.delete(:serializer) if default_serializer_options.dig(:serializer)

      namespaced_resource_object_class(:serializer) || raise(ArgumentError, 'Could not find Serializer Class')
    end
  end
end
