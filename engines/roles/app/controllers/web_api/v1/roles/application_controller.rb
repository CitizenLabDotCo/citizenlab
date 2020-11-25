module WebApi::V1::Roles
  class ApplicationController < ::ApplicationController
    skip_after_action :verify_authorized, unless: :policy_present?
    skip_after_action :verify_policy_scoped, unless: :policy_present?

    private

    def serialize_resources(*resources)
      serializer.new(resources.flatten, params: { current_user: current_user }).serialized_json
    end

    def roled_resource_class
      params[:roled].singularize.classify.safe_constantize
    end

    def roled_resource_primary_key
      [params[:roled].singularize, 'id'].join('_')
    end

    def role_name
      params[:role_name].to_s.singularize
    end

    def policy_present?
      policy_class.present?
    end

    def policy_scope_class
      policy_class::Scope
    end

    def policy_class
      role_config.policy
    end

    def policy_namespace
      params[:roled].classify.pluralize
    end

    def subscriber
      role_config.subscriber
    end

    def serializer
      role_config.serializer
    end

    def role_options
      roled_resource_class.roles[role_name]
    end

    def find_roleable(id)
      role_config.find_roleable(id)
    end

    def role_params_permitted_keys
      role_config.permitted_params
    end

    def role_config
      @role_config ||= Roles::RoleMapping.new(roled_resource_class, role_name)
    end
  end
end
