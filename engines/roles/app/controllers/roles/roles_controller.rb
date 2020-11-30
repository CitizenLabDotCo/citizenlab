module Roles
  class RolesController < Roles::ApplicationController
    before_action :find_roled_resource, except: %i[index]

    def index
      @roled_resources = scoped_resources
      @roled_resources = policy_scope(@roled_resources, policy_scope_class: policy_scope_class) if policy_present?
      render json: serialize_resources(@roled_resources), status: :ok
    end

    def create
      publish_before_create
      @roled_resource.send(:"add_#{role_name}_role", roleable)

      if @roled_resource.save
        publish_after_create
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      publish_before_destroy
      @roled_resource.send(:"remove_#{role_name}_role", roleable)

      if @roled_resource.save
        publish_after_destroy
        render json: serialize_resources(@roled_resource), status: :ok
      else
        render json: { errors: @roled_resource.errors }, status: :unprocessable_entity
      end
    end

    private

    def find_roled_resource
      @roled_resource = roled_resource
      authorize(@roled_resource, policy_class: policy_class) if policy_present?
    end

    def role_params
      params.require(role_name).permit(*role_params_permitted_keys)
    end

    def roleable
      @roleable ||= find_roleable(roleable_id)
    end

    def roled_resource
      if params.key?(:id)
        roled_resource_class.find_by_id(params[:id])
      elsif params.key?(role_name)
        roled_resource_class.find_by_id(role_params[roled_resource_primary_key])
      else
        current_user
      end
    end

    def scoped_resources
      if params.key?(role_association_foreign_key)
        roled_resource_class.send(role_name, params[role_association_foreign_key])
      else
        roled_resource_class.send(role_name)
      end
    end
  end
end
