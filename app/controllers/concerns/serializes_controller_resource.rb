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
      @serializer_options = options

      resource(resource_name, @serializer_options.delete(:resource_options) || {})

      define_api_serialized_resource_methods
    end

    private

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

    ##
    # Returns the +serializer+ class from the controller name or +options+ parameter.
    def serializer_class
      @serializer_class ||= extract_serializer_class
    end
  end
end
