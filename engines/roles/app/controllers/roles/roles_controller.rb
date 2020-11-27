module Roles
  class RolesController < Roles::ApplicationController
    before_action :find_roled_resource, except: %i[index]

    def index
      @roled_resources = scoped_resources
      @roled_resources = policy_scope(@roled_resources, policy_scope_class: policy_scope_class) if policy_present?
      render json: serialize_resources(@roled_resources), status: :ok
    end

    def update
      subscriber&.before_create(@roled_resource, roleable, current_user)
      @roled_resource.send(:"add_#{role_name}_role", roleable)

      if @roled_resource.save
        subscriber&.after_create(@roled_resource, roleable, current_user)
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      subscriber&.before_destroy(@roled_resource, roleable, current_user)
      @roled_resource.send(:"remove_#{role_name}_role", roleable)

      if @roled_resource.save
        subscriber&.after_destroy(@roled_resource, roleable, current_user)
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    private

    def scoped_resources
      if params.key?(roled_resource_primary_key)
        roled_resource_class.send(role_name, params[roled_resource_primary_key])
      else
        roled_resource_class.send(role_name)
      end
    end

    def find_roled_resource
      @roled_resource = roled_resource_class.find(params[:id])
      authorize(@roled_resource, policy_class: policy_class) if policy_present?
    end

    def role_params
      params.permit(*role_params_permitted_keys)
    end

    def roleable_id
      @roleable_id ||= role_params.dig(config.roleable_primary_key)
    end

    def roleable
      @roleable ||= find_roleable(roleable_id)
    end
  end
end
