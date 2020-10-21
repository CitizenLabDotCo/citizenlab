# frozen_string_literal: true

##
# Defines a Controller Macro to easily access a +resource+ in a controller.
module ExtractsControllerResource
  extend ActiveSupport::Concern

  included do
    extend ClassMethods
  end

  # ActionDispatch::Routing::Resources::CANONICAL_ACTIONS

  # The array of collection method symbols
  COLLECTION_METHODS = %i[index bulk_update].freeze

  # The array of member method symbols
  MEMBER_METHODS = %i[show create update destroy reorder].freeze

  ##
  # Defines the ClassMethods used by a Controller that ExtractsControllerResource.
  module ClassMethods
    ##
    # Defines a +#resource+ instance method that returns a *collection* or *member* of a class.
    #
    # @example Trigger the generator without passing a +resource_name+
    #   class IdeasController < ApplicationController
    #     include ExtractsControllerResource
    #
    #     resource
    #
    #     def index
    #       @ideas = Idea.all
    #       resource #=> @ideas
    #     end
    #
    #
    #     def show
    #       @idea = Idea.find(2)
    #       resource #=> @idea
    #     end
    #   end
    #
    # @example Trigger the generator passing a +resource_name+
    #   class AbstractController < ApplicationController
    #     include ExtractsControllerResource
    #
    #     resource :idea
    #
    #     def index
    #       @ideas = Idea.all
    #       resource #=> @ideas
    #     end
    #
    #
    #     def show
    #       @idea = Idea.find(2)
    #       resource #=> @idea
    #     end
    #   end
    #
    # @param resource_name [String, Symbol, nil]  The name of the +Resource+ class used in the controller's CRUD.
    # @param options [Hash, nil] The optional arguments to generate the resource helpers.
    # @return nil
    def resource(resource_name = nil, **options)
      @resource_name = resource_name || controller_resource_name
      @resource_options = options

      define_resource_methods
    end

    # A helper that extracts the current action from +params+ and returns a +member+ or +collection+ variable.
    # @param params [ActionController::Parameters]
    # @return [ActiveRecord::CollectionProxy, <Resource>]
    def resource_variable_from_params(params)
      return collection_variable if collection_method?(params)

      member_variable
    end

    private

    def collection_method?(params)
      COLLECTION_METHODS.include?(params[:action].to_sym)
    end

    def define_resource_methods
      define_method :resource do
        instance_variable_get self.class.resource_variable_from_params(params)
      end
    end

    def namespaced_resource_object_class(object_name)
      [namespaced_resource_class, object_name.to_s.classify].join.safe_constantize
    end

    def namespaced_resource_class
      to_s.gsub('Controller', '').singularize
    end

    def controller_resource_name
      namespaced_resource_class.demodulize
    end

    # @return ->
    def member_variable
      ['@', controller_resource_name.underscore].join
    end

    def collection_variable
      member_variable.pluralize
    end
  end
end
