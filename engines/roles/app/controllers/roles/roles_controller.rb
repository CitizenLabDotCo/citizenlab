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
  end
end
